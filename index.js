const express = require('express')
const app = express()
const httpError = require('http-status-codes')
const path = require('path')
const PORT = process.env.PORT || 5000
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/db/app.db');

app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'client')))
app.get('/', (req, res) => res.sendFile(path.join(__dirname,'client/html/home.html')))
app.listen(PORT, () => console.log(`Listening on ${ PORT }...`))

// Create a table just for once
db.run(`CREATE TABLE IF NOT EXISTS user (
  user_id INTEGER PRIMARY KEY,
  user_name STRING NOT NULL UNIQUE,
  password STRING NOT NULL)`);


 app.post('/h', function (req, res) {
  // Search a record
  console.log('here')
  console.log(req.body)
  console.log(req.body.user_name)
  if (req.body.user_name) {
    console.log('here5')
    db.get(`SELECT user_name, password FROM user WHERE user_name='${req.body.user_name}' AND password='${req.body.password}'`, (err, row) => {
      console.log('here5.5')
      if (!err) {
        console.log('here6')
        if (!row) {
          console.log('here7')
          console.log("No record matches");
          res.status(205).send({ exsisting: false });
        } else {
          console.log('here8')
          res.status(200).send({ exsisting: true });
        }
      } else {
        console.log('here9')
        console.log(err);
        res.sendStatus(205).send({ exsisting: err });
      }
    });
    console.log('here5.6')
  }
  console.log('here10')

  // Create a record
  console.log('here1')
  console.log(req.body.reg_name)
  if (req.body.reg_name) {
    console.log('here2')
    db.run(`SELECT user_id, user_name FROM user WHERE user_name='${req.body.reg_name}'`, (err, rows) => {
      if (!err) {
        if (rows) {
          console.log('here4')
          console.log(err+"User name already taken");
          res.status(401).send({ exsisting: false, created: false });
        } else {
          console.log('here3')
          console.log(req.body.reg_name, req.body.reg_password)
          db.run("INSERT INTO user (user_name, password ) VALUES (?, ?)", req.body.reg_name, req.body.reg_password);
          console.log(message = "1 new record added");
          res.status(201).send({ exsisting: false, created: true });
        }
      } else {
        console.log(err);
        res.sendStatus(205).send({ exsisting: err });
      }
    });
  }
  console.log('here11')
});
