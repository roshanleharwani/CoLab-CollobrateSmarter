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
const projectModel = require("./models/projectModel.js")
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


app.get('/teamProjects',async(req,res)=>{
  const allTeamProjects=await teamProject.find({});
  
  res.render('listings/teamProjects',{allTeamProjects});
})


app.get('/teamRegistration', (req, res) => {
  res.render('listings/TeamProjectRegistration');
})
app.post('/teamRegistration', async (req, res) => {
  let project = req.body.project;
  
  const existingMembers = JSON.parse(req.body.project.existing_members[1]);
  const requiredSkills=JSON.parse(req.body.project.skills[1]);
  // console.log(existingMembers);
  let insertObject = {
    personName: project.person_name,
    projectName: project.name.toUpperCase(),
    description: project.description,
    membersRequired: parseInt(project.members_required,10),
    members: existingMembers,
    requiredSkills:requiredSkills,
    projectId:uuidv4(),
    userId:req.session.userId,
    imageIndex: Math.floor(Math.random() * 6) + 1

    
  }
  
  const user=userModel.findById(insertObject.userId);
  console.log(user.email);
  console.log(insertObject)
  const newProject = new teamProject(insertObject);
  await newProject.save();

  console.log("new data saved");
  res.redirect('/teamProjects')
})
app.get('/teamProjects/:id',async(req,res)=>{
  const id=req.params.id;
  console.log(id);
  const project = await teamProject.findById(id);
  // console.log(project.id);
  // console.log(project);
  console.log(project);
  const currUser=req.session.userId;
  console.log(currUser);
  const user=await userModel.findById(currUser);
  const regNo=user.RegNumber.toUpperCase();
  console.log(regNo);
  res.render("listings/projectDetails",{project,regNo});
})

app.post('/request/:id/:name/:userId',async(req,res)=>{
  res.redirect("/requestSent");
  const projectId=req.params.id;
  // console.log(projectId);
  const project=await teamProject.findById(projectId);
  console.log(project);
  console.log('this is the end');
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
  console.log(Pid);
  // console.log('hello ji ye yha se start hua h ')
  // console.log(id);
  // console.log('HELLO JI YE KHATAM H');
  const user=await userModel.findById(userId);
  console.log(user);

  let obj={
    Pid:Pid,
    name:name,
    projectId:projectId
  }
   console.log(obj);
  user.requests.push(obj);
  await user.save();
  console.log(user)
})

app.get('/request/:id',async(req,res)=>{
  console.log("..................................................");
  const {id}=req.params;
  console.log(id);
  
  const currUser = await userModel.findById(id);

  if (!currUser) {
        return res.status(404).send('User not found'); 
  }

  console.log(currUser.requests);
  const requestArray = [];
  for (let i = 0; i < currUser.requests.length; i++) {
  const user = await userModel.findById(currUser.requests[i].Pid);
  
  if (user) {
    requestArray.push({user:user.name,projectName:currUser.requests[i].name,Pid:currUser.requests[i].Pid,projectId:currUser.requests[i].projectId});
  }
  }

  console.log(requestArray);  // Log the request names for debugging
  res.render('listings/requests',{requestArray});
})
app.get('/requestSent',(req,res)=>{
  res.render("listings/requestSent")
})
app.get('/accept/:personId/:postId', async (req, res) => {
  try {
      console.log('Start of request processing');
      
      // Fetch the person (recipient) and project by their IDs
      const person = await userModel.findById(req.params.personId);
      const myProject = await teamProject.findById(req.params.postId);
      console.log(person);
      console.log(myProject);

      // Check if person and project exist
      if (!person || !myProject) {
          return res.status(404).send('Person or project not found');
      }

      // console.log("Person found:", person);
      // console.log("Project found:", project);
      console.log("finding the user");
      console.log(person.RegNumber);
      // // Add the person to the project members (ensure 'RegNumber' exists)
      if (person.RegNumber) {
          myProject.members.push(person.RegNumber.toUpperCase());
          
      } else {
          console.log("Person does not have a RegNumber.");
          return res.status(400).send('Person has no RegNumber');
      }

      // // Loop through requests to find and remove the one with matching projectId
      console.log(myProject);
      const currUser=req.session.userId;
      const user=await userModel.findById(currUser);
      console.log(user);
      console.log("heyyyyyyyy");
      console.log(user);
      console.log("hellllllllloo");
      for (let i = 0; i < user.requests.length; i++) {
          if (user.requests[i].projectId === req.params.postId) {
              user.requests.splice(i, 1);  // Remove the request
              break;  // Exit the loop after removing the request
          }
      }

      // // Save the updated person document to the database
      await user.save();
      await myProject.save();
      console.log(user);
      console.log("my document updated successfully");
      req.flash("success", "request accepted");
      // // Redirect back to the requests page
      res.redirect(`/request/${req.session.userId}`);

      console.log("End of request processing");
  } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).send('Server error');
  }
});
app.get('/reject/:personId/:postId', async (req, res) => {
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
    console.error("Error processing request:",error);
    res.status(500).send('server error');
  }
})

app.listen(3000)