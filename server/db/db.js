const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
let db;

 (async () => {
  // open the database
    db = await open({
    filename: './server/db/app.db',
    driver: sqlite3.Database
  })
  // Create a table just for once
  db.run(`CREATE TABLE IF NOT EXISTS user (
    user_id INTEGER PRIMARY KEY,
    user_name STRING NOT NULL UNIQUE,
    password STRING NOT NULL)`
  );
})()

async function checkIn (name) {
  try {
    const result = await db.get(`SELECT user_id, user_name, password FROM user WHERE user_name='${name}'`);
    return result
  } catch (err) {
     return(err);
  }
}

async function checkUp (name) {
  try {
    const result = await db.get(`SELECT user_id, user_name FROM user WHERE user_name='${name}'`);
    return result
  } catch (err) {
     return(err);
  }
};

async function create (name, hashedPassword) {
  try {
    await db.run('INSERT INTO user (user_name, password ) VALUES (?, ?)', name, hashedPassword);
    const result = await db.get(`SELECT user_id, user_name FROM user WHERE user_name='${name}'`);
    return result
  } catch (err) {
     return(err);
  }
};

module.exports = {
  checkIn,
  checkUp,
  create
}
