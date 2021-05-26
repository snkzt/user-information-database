const express = require('express');

const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const transport = require('./server/routes/transport');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Listening on ${PORT}...`));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'client/html/home.html')));
app.get('/sign', transport.routeAccessibility, (req, res) => res.sendFile(path.join(__dirname, 'client/html/sign.html')));
app.get('/main', transport.authenticateToken, (req, res) => res.send(req.user));
app.get('/authenticated', (req, res) => res.sendFile(path.join(__dirname, 'client/html/main.html')));
app.get('/signout', transport.signOut, (req, res) => res.sendFile(path.join(__dirname, 'client/html/home.html')));

app.post('/signin', transport.signIn);
app.post('/signup', transport.signUp);
app.post('/getlist', transport.getList);
app.post('/createlist', transport.createList);
app.post('/updatelist', transport.updateList);
app.post('/deletelist', transport.deleteList);
