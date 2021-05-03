const express = require('express')
const httpError = require('http-status-codes')
const path = require('path')
const PORT = process.env.PORT || 5000
const app = express()
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
  // Create a record
  if (!req.body.reg_name) {
    db.run(`SELECT user_id, user_name FROM user WHERE user_name='${req.body.reg_name}'`, (err, rows) => {
      if (!err) {
        db.run("INSERT INTO user (user_name, password ) VALUES (?, ?)", req.body.reg_name, req.body.reg_password);
        console.log(message = "1 new record added");
        res.status(201);
      } else {
        console.log(err+"User name already taken");
        res.status(401);
      }
    });
  }

  // Search a record
  if (req.body.submit === "Welcome Back") {
    db.get(`SELECT user_name, password FROM user WHERE user_name='${req.body.user_name}' AND password='${req.body.password}'`, (err, row) => {
      if (!err) {
        if (!row) {
          console.log("No record matches");
          res.status(205)
        } else {
          res.status(200);
        }
      } else {
        console.log(err);
        res.status(205)
      }
    });
  }
});
