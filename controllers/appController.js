const nodemailer = require('nodemailer')
const { EMAIL, PASSWORD, uri, key } = require('../env')
const userModel = require('../models/userModel.js');
const teamProjectModel = require('../models/projectModel')
const bcrypt = require('bcryptjs')
const validateEmail = require('../emailvalidator.js')
const crypto = require('crypto');
const teamProject = require("../models/teamProject.js");
let config = {
    service: 'gmail',
    auth: {
        user: EMAIL,
        pass: PASSWORD
    }
}


let transporter = nodemailer.createTransport(config)


exports.indexPage = (req, res) => {
    if (req.session.isAuth == true) {
        
        return res.render('listings/home');
    }
    return res.render('listings/index')
}

exports.emailSend = async (req, res) => {
    const { name, email, message } = req.body;

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
        return res.render('listings/emailVerified');
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
            return res.render('listings/emailVerified');
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
        res.render('listings/resend');
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).render('listings/sentfailed'); // Render a failure page if email sending fails
    }
}

exports.create = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    const result = validateEmail(email);
    // req.session.email = email;
    // Check if passwords match
    if (password !== confirmPassword) {
        return res.render('listings/signup', { exists: false, pass: false });
    }

    // Check if email is valid
    if (!result.valid) {
        return res.render('listings/emailfailed');
    }

    try {
        // Check if the user already exists
        const isExist = await userModel.findOne({ email: email });

        if (isExist) {
            return res.render('listings/signup', { exists: true, pass: true });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Create a new user
        const user = await userModel.create({
            name: name,
            RegNumber: result.registrationNumber,
            email: email,
            password: hash,
            isVerified: false
        });

        // Store user ID in session
        req.session.userId = user._id;
        const host = req.get('host')
        const link = (host == 'localhost:3000') ? `http://${host}/verify/${user._id}` : `https://${host}/verify/${user._id}`

        // Email body and options
        const mailOptions = {
            from: EMAIL,
            to: user.email,
            subject: 'Verify Your Email Address',
            text: `
Hello,

Thank you for signing up with CoLab!

To complete your registration, please verify your email address by clicking the link below:

Verification Link: ${link}

If you did not create an account with us, please disregard this email.

If you have any questions or need assistance, feel free to reply to this email.

Thank you,
The CoLab Team
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        // Redirect to the resend email page
        return res.render('listings/verify');
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).send(error.message); // Render a generic error page
    }
}

exports.authenticate = async (req, res) => {

    try {
        let isExist = await userModel.findOne({ email: req.body.email });
        if (!isExist) {
            return res.render('listings/signin', { trial: false });
        }
        const isMatch = await bcrypt.compare(req.body.password, isExist.password);
        if (!isMatch) {
            return res.render('listings/signin', { trial: false });
        }
        if (isExist.isVerified) {
            req.session.isAuth = true;
            req.session.userId = isExist._id;
            return res.redirect('dashboard')
        }
        else {
            return res.render('listings/verify')
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
}

exports.dashboard = async (req, res) => {
    
    res.render('listings/home');
}

exports.forgetPassword = (req, res) => {
    return res.render('listings/emailforpass')
}

exports.sendResetLink = async (req, res) => {
    const email = req.body.email;

    let user = await userModel.findOne({ email: email });
    if (!user) {
        return res.status(404).send('User not found')
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    await userModel.findByIdAndUpdate(user._id, { resetToken: resetToken }, { new: true })

    const host = req.get('host')
    const resetLink = host == 'localhost:3000' ? `https://${host}/changePass/${resetToken}` : `http://${host}/changePass/${resetToken}`

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
    try {
        await transporter.sendMail(mailOptions);
        return res.render('listings/passwordEmail');
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

        return res.render('listings/changepassword', { user: user, match: 'fails' });
    } catch (error) {
        return res.status(500).send('Server error');
    }
}

exports.setPassword = async (req, res) => {
    const token = req.params.token
    let user = await userModel.findOne({ resetToken: token });
    if (!user) {
        return res.status(404).send('Invalid token')
    }
    const { password, confirmpassword } = req.body
    if (password !== confirmpassword) {
        return res.status(400).render('listings/changepassword', { match: false, user: user })
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    await userModel.findByIdAndUpdate(user._id, { password: hash, resetToken: "" }, { new: true })

    return res.render('listings/passSuccess')

}

exports.signIn = (req, res) => {
    if (req.session.isAuth == true) {
        console.log(req.session.userId);
        return res.redirect('/')
    }
    return res.render('listings/signin', { trial: true })
}

exports.signUp = (req, res) => {
    if (req.session.isAuth == true) {
        return res.redirect('/')
    }
    return res.render('listings/signup', { exists: false, pass: true })
}

exports.signOut = (req, res) => {
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


exports.leaderBoard = (req, res) => {
    res.render('listings/leaderboard')
}

exports.teamPages = (req, res) => {
    res.render('listings/teamProjects')
}

exports.addTeamProject = (req, res) => {
    res.render('listings/addProject')

}
async function getRandomColor() {
    const colors = ['rose', 'amber', 'lime', 'teal', 'sky', 'purple'];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

exports.listTeamProject = async (req, res) => {
    const { projectName, description, numberOfMembersRequired, existingMembers, skillsRequired, userName } = req.body
    const color = await getRandomColor();

    const project = await teamProjectModel.create({
        projectName: projectName,
        projectDescription: description,
        existingMembers: existingMembers,
        numberOfMembersRequired: numberOfMembersRequired,
        skillsRequired: skillsRequired,
        userName: userName,
        color: color
    })
    res.redirect('/teamProjects')


}

exports.feedback = (req, res) => {
    return res.render('listings/contact')
}

exports.about = (req, res) => {
    return res.render('listings/about')
}

exports.teamProjects=async(req,res)=>{
    const allTeamProjects=await teamProject.find({});
    
    res.render('listings/teamProjects',{allTeamProjects});
  }

exports.teamRegistration=(req, res) => {
    res.render('listings/TeamProjectRegistration');
  }

exports.teamRegistrationPost=async (req, res) => {
    let project = req.body.project;
    
    const existingMembers = JSON.parse(req.body.project.existing_members[1]);
    const requiredSkills=JSON.parse(req.body.project.skills[1]);
    // console.log(existingMembers);
    let insertObject = {
      personName: project.person_name,
      projectName: project.name.toUpperCase(),
      phoneNumber:project.phoneNumber,
      description: project.description,
      membersRequired: parseInt(project.members_required,10),
      members: existingMembers,
      requiredSkills:requiredSkills,
      projectId:uuidv4(),
      userId:req.session.userId,
      imageIndex: Math.floor(Math.random() * 6) + 1
  
      
    }
    
    const user=userModel.findById(insertObject.userId);
    // console.log(user.email);
    // console.log(insertObject)
    const newProject = new teamProject(insertObject);
    await newProject.save();
  
    // console.log("new data saved");
    res.redirect('/teamProjects')
  }

exports.projectDetails=async(req,res)=>{
    const id=req.params.id;
    // console.log(id);
    const project = await teamProject.findById(id);
    // console.log(project.id);
    // console.log(project);
    // console.log(project);
    const currUser=req.session.userId;
    // console.log(currUser);
    const user=await userModel.findById(currUser);
    const regNo=user.RegNumber.toUpperCase();
    // console.log(regNo);
    res.render("listings/projectDetails",{project,regNo,currUser});
  }
  
    exports.deleteProject=async(req,res)=>{
        const id=req.params.id;
        await teamProject.findByIdAndDelete(id);
        req.flash("success","Project deleted");
        res.redirect("/teamProjects");
    }

exports.sendRequest=async(req,res)=>{
    res.redirect("/requestSent");
    const projectId=req.params.id;
    // console.log(projectId);
    const project=await teamProject.findById(projectId);
    // console.log(project);
    // console.log('this is the end');
    const userId = req.params.userId;
      // console.log('User ID (raw):', userId);
  
      // Convert userId to ObjectId
      // console.log('User ID (ObjectId):', userObjectId);
      // console.log('User:', user);
    // // this id is basically of the person to whom the join button will send request
    // // this is receiving the name of the project
    const {name}=req.params;
    // // this is the id of the person who clicked on the join button
    const Pid=req.session.userId;
    const person=await userModel.findById(Pid);
    // console.log(Pid);
    // console.log('hello ji ye yha se start hua h ')
    // console.log(id);
    // console.log('HELLO JI YE KHATAM H');
    const user=await userModel.findById(userId);
    // console.log(user);
  
    let obj={
      Pid:Pid,
      name:name,
      projectId:projectId
    }
    //  console.log(obj);
    user.requests.push(obj);
    await user.save();
     const mailOptions = {
                from: EMAIL,
                to: user.email,
                subject: 'Collaboration Request Notification',
                text: `
Dear ${user.name},
  
You have received a collaboration request from ${person.name} (Registration Number: ${person.RegNumber.toUpperCase()}) regarding the project "${name}".
  
Please review the request and take the necessary steps to proceed. If you need any assistance or further details, feel free to reach out.
  
Best regards,
Team Colab
                `
            };
    
            // Send the email
            await transporter.sendMail(mailOptions);
    // console.log(user)
  }

  exports.requests=async(req,res)=>{
    // console.log("..................................................");
    const {id}=req.params;
    // console.log(id);
    
    const currUser = await userModel.findById(id);
  
    if (!currUser) {
          return res.status(404).send('User not found'); 
    }
  
    // console.log(currUser.requests);
    const requestArray = [];
    for (let i = 0; i < currUser.requests.length; i++) {
    const user = await userModel.findById(currUser.requests[i].Pid);
    
    if (user) {
      requestArray.push({user:user.name,projectName:currUser.requests[i].name,Pid:currUser.requests[i].Pid,projectId:currUser.requests[i].projectId});
    }
    }
  
    // console.log(requestArray);  // Log the request names for debugging
    res.render('listings/requests',{requestArray});
  }

  exports.requestSent=(req,res)=>{
    res.render("listings/requestSent")
  }

  exports.acceptRequest=async (req, res) => {
    try {
        // console.log('Start of request processing');
        
        // Fetch the person (recipient) and project by their IDs
        const person = await userModel.findById(req.params.personId);
        const personEmail=person.email;
        const currPersonId=req.session.userId;
        const currPerson=await userModel.findById(currPersonId);
        const ownerName=currPerson.name;
        const myProject = await teamProject.findById(req.params.postId);
        // console.log(person);
        // console.log(myProject);
  
        // Check if person and project exist
        if (!person || !myProject) {
            return res.status(404).send('Person or project not found');
        }
  
        // console.log("Person found:", person);
        // console.log("Project found:", project);
        // console.log("finding the user");
        // console.log(person.RegNumber);
        // // Add the person to the project members (ensure 'RegNumber' exists)
        if (person.RegNumber) {
            myProject.members.push(person.RegNumber.toUpperCase());
            
        } else {
            console.log("Person does not have a RegNumber.");
            return res.status(400).send('Person has no RegNumber');
        }
  
        // // Loop through requests to find and remove the one with matching projectId
        // console.log(myProject);
        const currUser=req.session.userId;
        const user=await userModel.findById(currUser);
        // console.log(user);
        
        for (let i = 0; i < user.requests.length; i++) {
            if (user.requests[i].projectId === req.params.postId) {
                user.requests.splice(i, 1);  // Remove the request
                break;  // Exit the loop after removing the request
            }
        }
  
        // // Save the updated person document to the database
        await user.save();
        await myProject.save();
        // console.log(user);
        // console.log("my document updated successfully");
        req.flash("success", "request accepted");
        // // Redirect back to the requests page
        res.redirect(`/request/${req.session.userId}`);
        const mailOptions = {
          from: process.env.EMAIL,
          to: personEmail,
          subject: 'Acceptance of request',
          text: `
  Dear ${person.name},
  
  I hope this message finds you well. I am pleased to inform you that your request regarding ${myProject.projectName} has been reviewed and accepted.
  
  We value your interest and are excited to move forward with this. Here are the details of the approval:
  
  
  Next Steps: kindly contact me in the given below number for further processes
  If you have any questions or require further assistance, please feel free to reach out to us at ${myProject.phoneNumber}. We look forward to working with you and making this a success.
  
  Thank you for reaching out to us.
  
  Best regards,
  ${ownerName}
  Leader
  ${myProject.projectName}
  ${myProject.phoneNumber}
          `
      };
  
      // Send the email
      await transporter.sendMail(mailOptions);
    //   console.log("email has been sent");
    //     console.log("End of request processing");
    } catch (error) {
        // console.error("Error processing request:", error);
        res.status(500).send('Server error');
    }
  }

  exports.rejectRequest=async (req, res) => {
    try{
      const currUser=req.session.userId;
      const user=await userModel.findById(currUser);
      for (let i = 0; i < user.requests.length; i++) {
        if (user.requests[i].projectId === req.params.postId) {
            user.requests.splice(i, 1);  // Remove the request
            break;  // Exit the loop after removing the request
        }
    }
    await user.save();
    req.flash("error", "request Rejected");
    res.redirect(`/request/${req.session.userId}`);
  
  
    }catch(error){
    //   console.error("Error processing request:",error);
      res.status(500).send('server error');
    }
  }

  exports.hackathonRegistration=(req,res)=>{
    res.render("listings/hackathonRegistration")
  }