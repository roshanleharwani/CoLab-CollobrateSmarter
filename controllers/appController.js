const nodemailer = require('nodemailer')
const {EMAIL,PASSWORD,uri,key} = require('../env')
const userModel = require('../models/userModel.js')
const puppeteer  = require('puppeteer')
const bcrypt = require('bcrypt')
const validateEmail = require('../emailvalidator.js')
const crypto = require('crypto')
const ejsMate = require('ejs-mate') 
const path = require('path')
let config = {
    service:'gmail',
    auth:{
        user:EMAIL,
        pass:PASSWORD
    }
}


let transporter = nodemailer.createTransport(config)


exports.indexPage = (req,res)=>{
    if(req.session.isAuth==true){
        return res.render('dashboard')
    }
    return res.render('index')
}

exports.emailSend = async (req, res) => {
    const { name, email, message} = req.body;

    try {

        // Prepare email body
        const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
        const mailOptions = {
            from: EMAIL,
            to: ['roshanleharwani@gmail.com'],
            subject: 'CoLab Contact',
            text: body,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        return res.status(200).render('sent');

    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).render('sentfailed', { error: 'An error occurred. Please try again later.' });
    }
}

exports.emailVerify = async (req, res) => {
    const id = req.params.id;
  
    try {
      // Attempt to find the user by ID and update the isVerified field
      const updatedUser = await userModel.findByIdAndUpdate(
        id, 
        { isVerified: true }, 
        { new: true } // Return the updated document
      );
  
      if (!updatedUser) {
        // If no user is found with the given ID, return a 404 response
        return res.status(404).send('User not found');
      }
  
      // If the update is successful, send a confirmation response
      return res.render('emailVerified');
    } catch (err) {
      // If there's an error during the database operation, return a 500 response
      console.error(err);
      return res.status(500).send('An error occurred while verifying the email.');
    }
  }

exports.resend = async (req, res) => {
    try {
        // Retrieve user ID and email from the session
        const userId = req.session.userId; // Use req.session.userId as set during user creation
        const email = req.session.email; // Replace with actual method if stored differently

        // Check if the session contains the necessary information
        if (!email || !userId) {
            return res.status(400).send('Email or user ID not provided');
        }

        // Retrieve the user from the database
        const user = await userModel.findById(userId);

        // Check if the user is already verified
        if (user.isVerified) {
            return res.render('emailVerified');
        }

        // Configure the email transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: EMAIL, // Use environment variables for sensitive information
                pass: PASSWORD
            }
        });

        // Email body and options
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Verify Your Email Address',
            text: `
Hello,

Thank you for signing up with CoLab!

To complete your registration, please verify your email address by clicking the link below:

Verification Link: https://${req.get('host')}/verify/${userId}

If you did not create an account with us, please disregard this email.

If you have any questions or need assistance, feel free to reply to this email or contact our support team at support@yourcompany.com.

Thank you,
The CoLab Team
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        // Render the resend confirmation page
        res.render('resend');
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).render('sentfailed'); // Render a failure page if email sending fails
    }
}

exports.create = async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    const result = validateEmail(email);
    // req.session.email = email;
    // Check if passwords match
    if (password !== confirmPassword) {
        return res.render('signup', { exists: false, pass: false });
    }

    // Check if email is valid
    if (!result.valid) {
        return res.render('emailfailed');
    }

    try {
        // Check if the user already exists
        const isExist = await userModel.findOne({ email: email });

        if (isExist) {
            return res.render('signup', { exists: true, pass: true });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Create a new user
        const user = await userModel.create({
            RegNumber: result.registrationNumber,
            email: email,
            password: hash,
            isVerified: false
        });

        // Store user ID in session
        // req.session.userId = user._id;


        // Email body and options
        const mailOptions = {
            from: EMAIL,
            to: user.email,
            subject: 'Verify Your Email Address',
            text: `
Hello,

Thank you for signing up with CoLab!

To complete your registration, please verify your email address by clicking the link below:

Verification Link: https://${req.get('host')}/verify/${user._id}

If you did not create an account with us, please disregard this email.

If you have any questions or need assistance, feel free to reply to this email.

Thank you,
The CoLab Team
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        // Redirect to the resend email page
        return res.render('verify');
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).send(error.message); // Render a generic error page
    }
}

exports.authenticate = async (req, res) => {
    
    try {
        let isExist = await userModel.findOne({ email: req.body.email });
        if (!isExist) {
            return res.render('signin', { trial: false }); 
        }
        const isMatch = await bcrypt.compare(req.body.password, isExist.password);
        if (!isMatch) {
            return res.render('signin', { trial: false }); 
        }
        if(isExist.isVerified){
            req.session.isAuth = true;
            return res.redirect('/dashboard')
        }
        else{
            return res.render('verify')
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
}

exports.dashboard = (req,res)=>{
    res.render('dashboard')
}

exports.forgetPassword = (req,res)=>{
    return res.render('emailforpass')
}

exports.sendResetLink = async (req,res)=>{
    const email = req.body.email;

    let user = await userModel.findOne({email:email});
    if(!user){
        return res.status(404).send('User not found')
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    await userModel.findByIdAndUpdate(user._id,{resetToken:resetToken},{new:true})

    const resetLink = `https://${req.get('host')}/changePass/${resetToken}`

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Account recovery',
        text: `
Hello,

Please click on the link below to reset your password.

Reset Link: ${resetLink}

If you did not request for account password reset, please disregard this email.

If you have any questions or need assistance, feel free to reply to this email or contact our support team at support@yourcompany.com.

Thank you,
The CoLab Team`
    };
    try{
        await transporter.sendMail(mailOptions);
        return res.render('passwordEmail');
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).send(error.message); 
    }

}

exports.changePassword = async (req, res) => {
    try {
        const token = req.params.token;
        const user = await userModel.findOne({ resetToken: token });
        
        if (!user) {
            return res.status(404).send('Invalid or expired token');
        }

        return res.render('changepassword', { user: user, match: 'fails' });
    } catch (error) {
        return res.status(500).send('Server error');
    }
}

exports.setPassword = async (req,res)=>{
    const token = req.params.token
    let user = await userModel.findOne({resetToken:token});
    if(!user){
        return res.status(404).send('Invalid token')
    }
    const {password,confirmpassword} = req.body
    if(password !== confirmpassword){
        return res.status(400).render('changepassword',{match:false,user:user})
        }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    await userModel.findByIdAndUpdate(user._id,{password:hash,resetToken:""},{new:true})
    
    return res.render('passSuccess')
    
}

exports.signIn = (req,res)=>{
    if(req.session.isAuth==true){
        return res.redirect('/')
    }
    return res.render('signin',{trial:true})
}

exports.signUp = (req,res)=>{
    if(req.session.isAuth==true){
        return res.redirect('/')
    }
    return res.render('signup',{exists:false,pass:true})
}

exports.signOut = (req,res)=>{
    req.session.destroy((err) => {
        if (err) {
          console.log('Error destroying session:', err);
          // Handle the error if necessary
          return res.status(500).send('Error logging out.');
        }
    
        // Optionally, you can clear the cookie
        res.clearCookie('connect.sid', { path: '/' });
    
        // Redirect to login or home page after logout
        res.redirect('/signIn');
      });
}


exports.leaderBoard = (req,res)=>{
    res.render('leaderboard')
}

exports.generate = async (req, res) => {
    let browser;
    
    try {
        // Launch browser explicitly in headless mode with a timeout
        browser = await puppeteer.launch();

        const page = await browser.newPage();

        // Set a timeout for navigation
        await page.goto(`${req.protocol}://${req.get('host')}/report`, {
            waitUntil: 'networkidle2',
            timeout: 30000 // 30 seconds timeout to avoid indefinite loop
        });

        await page.setViewport({ width: 1680, height: 1050 });

        // Generate the PDF file path
        const filePath = path.join(__dirname, '../public/files/', `${new Date().getTime()}.pdf`);

        // Generate the PDF
        const pdf = await page.pdf({
            path: filePath,
            printBackground: true,
            format: 'A4'
        });

        await browser.close();

        // Set response headers for PDF file
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdf.length
        });

        // Send the generated PDF file
        res.sendFile(filePath);

    } catch (error) {
        console.log(error.message);
        if (browser) {
            await browser.close(); // Ensure browser is closed in case of error
        }
        res.status(500).send('Error generating PDF');
    }
};


exports.report = (req,res)=>{
    res.render('report')
}