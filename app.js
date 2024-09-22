const express = require("express")
const app = express()
const path = require('path')
const {uri,key} = require('./env')
const isAuth = require('./middleware/isAuth.js')
const controller = require('./controllers/appController.js')
const session = require('express-session')
const MongoDBStore = require("connect-mongodb-session")(session);
const DataBase = require('./connect/db.js')
const ejsMate = require('ejs-mate')

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


app.set('view engine','ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"public")))
app.engine("ejs",ejsMate);


app.get('/',controller.indexPage)

app.post('/send', controller.emailSend);

app.get('/verify/:id', controller.emailVerify);

app.get('/resend', controller.resend);

app.post('/create', controller.create);

app.get('/signOut',controller.signOut)

app.post('/authenticate', controller.authenticate);

app.get('/dashboard',isAuth,controller.dashboard)

app.get('/forgetPassword',controller.forgetPassword)

app.post('/send-reset-link',controller.sendResetLink)

app.get('/changePass/:token', controller.changePassword);

app.post('/setPassword/:token',controller.setPassword)

app.get('/signIn',controller.signIn)

app.get('/signUp',controller.signUp)

app.get('/leaderboard',isAuth,controller.leaderBoard)

app.get('/teamProjects',isAuth,controller.teamPages)

app.get('/feedback',isAuth,controller.feedback)

app.listen(3000)