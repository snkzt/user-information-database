const express = require('express')
const app = express()
const path = require('path')
const PORT = process.env.PORT || 5000
const bodyParser = require('body-parser')
const db = require("./server/db.js");

app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'client')))
app.get('/', (req, res) => res.sendFile(path.join(__dirname,'client/html/home.html')))
app.listen(PORT, () => console.log(`Listening on ${ PORT }...`))

db.initialise;
app.post('/signin', function (req, res) {
  // Search a record
  const name = req.body.user_name;
  const pw = req.body.password;
  const cb = function (err, row) {
    if (req.body.user_name) {
      if (!err) {
        if (row) {
          res.status(200).send({ exsisting: true });
        } else {
          console.log("No record matches")
          res.status(401).send({ exsisting: false });
        }
      } else {
        console.log(err)
        res.sendStatus(205).send({ err: true });
      }
    }
 }
 db.checkIn (name, pw, cb);
});

app.post('/signup', function (req, res) {
  // Create a record
  const name = req.body.reg_name;
  const pw = req.body.reg_password;
  const cb = function (err, row) {
    if (req.body.reg_name) {
      if (!err) {
        if (row) {
          console.log("User name already taken");
          res.status(401).send({ exsisting: false, created: false });
        } else {
          db.create (name, pw);
          console.log(message = "1 new record added");
          res.status(201).send({ exsisting: false, created: true });
        }
      } else {
        console.log(err);
        res.sendStatus(205).send({ exsisting: err });
      }
    }
  }
  db.checkUp (name, cb);
});
