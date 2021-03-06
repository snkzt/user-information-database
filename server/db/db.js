const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();

let db;

(async () => {
  // open the database
  db = await open({
    filename: './server/db/app.db',
    driver: sqlite3.Database,
  });

  // Create tables just for once
  db.run(`CREATE TABLE IF NOT EXISTS user (
    user_id INTEGER PRIMARY KEY UNIQUE,
    user_name STRING NOT NULL UNIQUE,
    password STRING NOT NULL)`);

  db.run(`CREATE TABLE IF NOT EXISTS list (
    item_id INTEGER PRIMARY KEY UNIQUE,
    user_id INTEGER NOT NULL,
    create_date STRING NOT NULL,
    due_date STRING,
    item STRING NOT NULL,
    FOREIGN KEY (user_id) 
    REFERENCES user (user_id)
    ON UPDATE CASCADE
    ON DELETE CASCADE)`);
})();

async function checkIn(name) {
  try {
    const result = await db.get(`SELECT user_id, user_name, password FROM user WHERE user_name='${name}'`);
    return result;
  } catch (err) {
    return (err);
  }
}

async function checkUp(name) {
  try {
    const result = await db.get(`SELECT user_id, user_name FROM user WHERE user_name='${name}'`);
    return result;
  } catch (err) {
    return (err);
  }
}

async function createUser(name, hashedPassword) {
  try {
    await db.run(`INSERT INTO user (user_name, password) VALUES ('${name}', '${hashedPassword}')`);
    const result = await db.get(`SELECT user_id, user_name FROM user WHERE user_name='${name}'`);
    return result;
  } catch (err) {
    return (err);
  }
}

async function getList(usrId) {
  try {
    const result = await db.all(`SELECT item_id, create_date, due_date, item FROM list WHERE user_id='${usrId}'`);
    return result;
  } catch (err) {
    return (err);
  }
}

async function createList(usrId, cDate, dDate, item) {
  try {
    await db.run(`INSERT INTO list (user_id, create_date, due_date, item) VALUES ('${usrId}', '${cDate}', '${dDate}', '${item}')`);
    return '200';
  } catch (err) {
    return (err);
  }
}

async function updateList(itemId, usrId, dDate, item) {
  try {
    await db.run(`UPDATE list SET due_date='${dDate}', item='${item}' WHERE user_id='${usrId}' AND item_id='${itemId}'`);
    return '200';
  } catch (err) {
    return (err);
  }
}

async function deleteList(itemId, usrId) {
  try {
    await db.run(`DELETE FROM list WHERE user_id='${usrId}' AND item_id='${itemId}'`);
    return '200';
  } catch (err) {
    return (err);
  }
}

module.exports = {
  checkIn,
  checkUp,
  createUser,
  getList,
  createList,
  updateList,
  deleteList,
};
