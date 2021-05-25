require('dotenv').config();
const bcrypt = require('bcrypt');

const saltRounds = 10;
const jwt = require('jsonwebtoken');
const db = require('../db/db');

// Check if the user is already authenticated
function checkAuthStatus(authCookie) {
  jwt.verify(authCookie, process.env.ACCESS_TOKEN_SECRET, (err) => {
    if (err) {
      console.error(err);
      return '403';
    }
    return '200';
  });
}

function setToken(authenticatedUser) {
  const accessToken = jwt.sign(authenticatedUser, process.env.ACCESS_TOKEN_SECRET);
  return accessToken;
}

// Check user existense
async function signInDbQuery(name, pw) {
  const data = await db.checkIn(name);
  if (data) {
    const id = data.user_id;
    const uName = data.user_name;
    const err = data;
    if (id && uName) {
      const result = await bcrypt.compare(pw, data.password);
      const authenticatedUser = { id, name: uName };
      if (result) {
        const accessToken = setToken(authenticatedUser);
        return accessToken;
      }
      return '401';
    }
    console.error(err);
    return '404';
  }
  return '404';
}

// Create a new user
async function signUpDbQuery(name, pw) {
  const hashedPassword = await bcrypt.hash(pw, saltRounds);
  const data = await db.checkUp(name);
  if (data) {
    const uName = data.user_name;
    const err = data;
    if (uName) {
      return '401';
    }
    console.error(err);
    return '500';
  }
  const dataC = await db.createUser(name, hashedPassword);
  console.log('1 new user added');
  const authenticatedUser = { id: dataC.user_id, name: dataC.user_name };
  if (dataC.user_id) {
    return setToken(authenticatedUser);
  }
  return '500';
}

// Middlewear for sending cookie information to client side
function tokenCheck(authCookie) {
  if (authCookie === null) {
    return '401';
  }
  jwt.verify(authCookie, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.error(err);
      return '403';
    }
    return user;
  });
}

// Get user's lists on the sign in
async function queryList(usrId) {
  const lists = await db.getList(usrId);
  if (lists) {
    return lists;
  }
  return '500';
}

// Save new list
async function newList(usrId, cDate, dDate, item) {
  await db.createList(usrId, cDate, dDate, item);
  const addedList = await db.getList(usrId);
  if (addedList) {
    return addedList;
  }
  return '500';
}

// Save updated list
async function updatedList(itemId, usrId, dDate, item) {
  await db.updateList(itemId, usrId, dDate, item);
  const updatedLists = await db.getList(usrId);
  if (updatedLists) {
    return updatedLists;
  }
  return '500';
}

// Delete list
async function deletedList(itemId, usrId) {
  await db.deleteList(itemId, usrId);
  const changedList = await db.getList(usrId);
  if (changedList) {
    return changedList;
  }
  return '500';
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
