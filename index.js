const express = require('express')
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
  app.post('/html/sign.html', function (req, res) {
    db.run(`CREATE TABLE IF NOT EXISTS user (
      user_id INTEGER PRIMARY KEY,
      user_name STRING NOT NULL,
      password STRING NOT NULL)`);

    // Create a record
    if (req.body.submit === "Register") {
      if(req.body.reg_password !== req.body.confirm_password) {
        console.log("password doesnt match");
      } else {
        db.run(`SELECT user_id, user_name FROM user WHERE user_name='${req.body.user_name}'`, (err, rows) => {
          if (!err) {
            db.run("INSERT INTO user (user_name, password ) VALUES (?, ?)", req.body.reg_name, req.body.reg_password);
            console.log(message = "1 new record added");
            res.sendFile(path.join(__dirname,'client/html/main.html'));
          } else {
            console.log(err+"User name already taken");
          }
        });
      }
    }

    // Search a record
    if (req.body.submit === "Welcome Back") {
      db.get(`SELECT user_name, password FROM user WHERE user_name='${req.body.user_name}' AND password='${req.body.password}'`, (err, row) => {
        if (!err) {
          if (!row) {
            console.log("No record matches");
            res.sendFile(path.join(__dirname,'client/html/sign.html'));
          } else {
            res.sendFile(path.join(__dirname,'client/html/main.html'));
          }
        } else {
          console.log(err);
        }
      });
    }

    // db.close((err) => {
    //   if (err) {
    //     return console.error(err.message);
    //   }
    //   console.log('Close the database connection.');
    // });
  });
