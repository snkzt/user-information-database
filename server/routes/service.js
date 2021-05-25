require('dotenv').config();
const bcrypt = require('bcrypt');

const saltRounds = 10;
const jwt = require('jsonwebtoken');
const db = require('../db/db');

// Check if the user is already authenticated
function checkAuthStatus(authCookie) {
  jwt.verify(authCookie, process.env.ACCESS_TOKEN_SECRET, (err) => {
    if (err) {
      console.log(err);
      return '403';
    }
  });
}

// Check user existense
async function signInDbQuery(name, pw) {
  let checkedReturn;
  const data = await db.checkIn(name);
  if (data) {
    const id = data.user_id;
    const uName = data.user_name;
    const err = data;
    if (id && uName) {
      await bcrypt.compare(pw, data.password)
        .then(async (result) => {
          const authenticatedUser = { id, name: uName };
          if (result) {
            checkedReturn = setToken(authenticatedUser);
          } else {
            checkedReturn = '401';
          }
        });
    } else {
      console.error(err);
    }
  } else {
    checkedReturn = '404';
  }
  return checkedReturn;
}

// Create a new user
async function signUpDbQuery(name, pw) {
  let createdReturn;
  const hashedPassword = await bcrypt.hash(pw, saltRounds);
  const data = await db.checkUp(name);
  if (data) {
    const uName = data.user_name;
    const err = data;
    if (uName) {
      createdReturn = '401';
    } else {
      console.error(err);
    }
  } else {
    const dataC = await db.createUser(name, hashedPassword);
    console.log('1 new user added');
    const authenticatedUser = { id: dataC.user_id, name: dataC.user_name };
    if (dataC.user_id) {
      createdReturn = setToken(authenticatedUser);
    } else {
      createdReturn = '500';
    }
  }
  return createdReturn;
}

function setToken(authenticatedUser) {
  const accessToken = jwt.sign(authenticatedUser, process.env.ACCESS_TOKEN_SECRET);
  return accessToken;
}

// Middlewear for sending cookie information to client side
function tokenCheck(authCookie) {
  let checkedToken;
  if (authCookie === null) {
    checkedToken = '401';
  } else {
    jwt.verify(authCookie, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        checkedToken = '403';
      } else {
        checkedToken = user;
      }
    });
  }
  return checkedToken;
}

// Get user's lists on the sign in
async function queryList(usrId) {
  let queryResult;
  const lists = await db.getList(usrId);
  if (lists) {
    queryResult = lists;
  } else {
    queryResult = '500';
  }
  return queryResult;
}

// Save new list
async function newList(usrId, cDate, dDate, item) {
  let createdList;
  await db.createList(usrId, cDate, dDate, item);
  const addedList = await db.getList(usrId);
  if (addedList) {
    createdList = addedList;
  } else {
    createdList = '500';
  }
  return createdList;
}

// Save updated list
async function updatedList(itemId, usrId, dDate, item) {
  let modifiedList;
  await db.updateList(itemId, usrId, dDate, item);
  const updatedList = await db.getList(usrId);
  if (updatedList) {
    modifiedList = updatedList;
  } else {
    modifiedList = '500';
  }
  return modifiedList;
}

// Delete list
async function deletedList(itemId, usrId) {
  let deletedList;
  await db.deleteList(itemId, usrId);
  const changedList = await db.getList(usrId);
  if (changedList) {
    deletedList = changedList;
  } else {
    deletedList = '500';
  }
  return deletedList;
}

module.exports = {
  checkAuthStatus,
  signInDbQuery,
  signUpDbQuery,
  tokenCheck,
  queryList,
  newList,
  updatedList,
  deletedList,
};
