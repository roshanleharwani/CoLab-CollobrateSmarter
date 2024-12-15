const express = require("express")
const app = express()
const path = require('path')
const { uri, key } = require('./env')
const isAuth = require('./middleware/isAuth.js')
const controller = require('./controllers/appController.js')
const session = require('express-session')
const MongoDBStore = require("connect-mongodb-session")(session);
const DataBase = require('./connect/db.js')
const ejsMate = require('ejs-mate')
const teamProject = require("./models/teamProject.js");
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const userModel = require('./models/userModel.js');
const flash=require("connect-flash");
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const projectModel = require("./models/projectModel.js")

// email purpose
const nodemailer = require('nodemailer')
const { EMAIL, PASSWORD} = require('./env.js')
let config = {
    service: 'gmail',
    auth: {
        user: EMAIL,
        pass: PASSWORD
    }
}


let transporter = nodemailer.createTransport(config)
// local database
// main().then(() => {
//   console.log("Connected to database");

// }).catch(err => console.log(err));

// async function main() {
//   await mongoose.connect('mongodb://127.0.0.1:27017/COLAB', {

//   });
// }
DataBase.connect(uri)

const store = new MongoDBStore({
  uri: uri,
  collection: "userSession",
});


app.use(session({
  secret: key,
  resave: false,
  saveUninitialized: false,
  store: store
}));
app.use(flash());

app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))
app.engine("ejs", ejsMate);
app.use((req, res, next) => {
  res.locals.currUserId=req.session.userId;
  res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
  next();
});

app.get('/', controller.indexPage)

app.post('/send', controller.emailSend);

app.get('/verify/:id', controller.emailVerify);

app.get('/resend', controller.resend);

app.post('/create', controller.create);

app.get('/signOut', isAuth, controller.signOut)

app.post('/authenticate', controller.authenticate);

app.get('/dashboard', isAuth, controller.dashboard)

app.get('/forgetPassword', controller.forgetPassword)

app.post('/send-reset-link', controller.sendResetLink)

app.get('/changePass/:token', controller.changePassword);

app.post('/setPassword/:token', controller.setPassword)

app.get('/signIn', controller.signIn)

app.get('/signUp', controller.signUp)

app.get('/leaderboard', isAuth, controller.leaderBoard)

// app.get('/teamProjects', isAuth, controller.teamPages)

app.get('/feedback', isAuth, controller.feedback)

app.get('/about', isAuth, controller.about)

app.get('/teamProjects',isAuth,controller.teamProjects)

app.get('/teamRegistration',isAuth,controller.teamRegistration)

app.post('/teamRegistration',isAuth,controller.teamRegistrationPost)

app.get('/teamProjects/:id',isAuth,controller.projectDetails);

app.delete('/delete/:id',isAuth,controller.deleteProject);

app.post('/request/:id/:name/:userId',isAuth,controller.sendRequest)

app.get('/request/:id',isAuth,controller.requests)

app.get('/requestSent',isAuth,controller.requestSent)

app.get('/accept/:personId/:postId',isAuth,controller.acceptRequest);

app.get('/reject/:personId/:postId',isAuth,controller.rejectRequest);

app.get('/competeRegistration',isAuth,controller.hackathonRegistration);

app.get('/profile',(req,res)=>{
  res.render('listings/userDetails.ejs')
})
app.get('/edit',(req,res)=>{
  res.render('listings/editUserDetails.ejs')
})

app.listen(3000)