const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../../db/app.db');
const username = document.getElementById('name');
const pw = document.getElementById('password');

db.run(`CREATE TABLE user IF NOT EXISTS(
  user_id INTEGER PRIMARY KEY,
  user_name STRING NOT NULL,
  password STRING NOT NULL)`)
  .run(`INSERT INTO user(user_name, password)
    VALUES(username, pw)
  `);

  // db.run(function(err) {
  //   if (err) {
  //     return console.error(err.message);
  //   }
  // });

  db.close();