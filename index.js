const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const db = require('./server/db/db');
const logic = require('./server/routes/logic');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Listening on ${ PORT }...`))

app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'client')))

app.get('/', (req, res) => res.sendFile(path.join(__dirname,'client/html/home.html')))
app.get('/sign', logic.routeAccessibility, (req, res) => res.sendFile(path.join(__dirname,'client/html/sign.html')))
app.get('/main', logic.authenticateToken, (req, res) => res.send(req.user))
app.get('/authenticated', (req, res) => res.sendFile(path.join(__dirname,'client/html/main.html')))
app.get('/signout', logic.signOut, (req, res) =>  res.sendFile(path.join(__dirname,'client/html/home.html')))

app.post('/signin', logic.signIn)
app.post('/signup', logic.signUp)
app.post('/getlist', logic.getList)
app.post('/createlist', logic.createList)
app.post('/updatelist', logic.updateList)
app.post('/deletelist', logic.deleteList)

