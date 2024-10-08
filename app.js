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


app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))
app.engine("ejs", ejsMate);
app.use((req, res, next) => {
  res.locals.currUserId=req.session.userId;
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
  const project = await teamProject.findById(id);
  console.log(project);
  res.render("listings/projectDetails",{project});
})

app.post('/request/:id/:name/:projectId',async(req,res)=>{
  const projectId=new mongoose.Types.ObjectId(req.params.projectId);
  const project=await projectModel.findById(projectId);
  console.log(project);
  console.log(projectId)
  const id =new mongoose.Types.ObjectId(req.params.id);
  // this id is basically of the person to whom the join button will send request
  console.log(id);
  // this is receiving the name of the project
  const {name}=req.params;
  // this is the id of the person who clicked on the join button
  const Pid=req.session.userId;
  
  const user=await userModel.findById(id);
  console.log(Pid);
  let obj={
    Pid:Pid,
    name:name,
    projectId:projectId
  }
   
  user.requests.push(obj);
  await user.save();
  console.log(user)
})

app.get('/request/:id',async(req,res)=>{
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

app.get('/accept/:personId/:postId',async(req,res)=>{
    const personId=new mongoose.Types.ObjectId(req.params.personId);
    const projectId=new mongoose.Types.ObjectId(req.params.postId);
    console.log(projectId);
    const person=await userModel.findById(personId);
    const project=await projectModel.findById(projectId);
    console.log(person);
    console.log(project);
})
app.listen(3000)