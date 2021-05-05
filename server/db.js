const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/db/app.db');

// Create a table just for once
const initialise = db.run(`CREATE TABLE IF NOT EXISTS user (
  user_id INTEGER PRIMARY KEY,
  user_name STRING NOT NULL UNIQUE,
  password STRING NOT NULL)`);

async function checkIn (name, pw, cb) {
  db.get(`SELECT user_name, password FROM user WHERE user_name='${name}' AND password='${pw}'`, cb);
};

async function checkUp (name, cb) {
  db.get(`SELECT user_id, user_name FROM user WHERE user_name='${name}'`, cb);
};

async function create (name, pw) {
  db.run('INSERT INTO user (user_name, password ) VALUES (?, ?)', name, pw);
};

  module.exports = {
    initialise,
    checkIn,
    checkUp,
    create
  }