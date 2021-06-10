require('dotenv').config();
const bcrypt = require('bcrypt');

const saltRounds = 10;
const jwt = require('jsonwebtoken');
const db = require('../db/db');

// Check if the user is already authenticated
function checkAuthStatus(authCookie) {
  const authenticated = jwt.verify(authCookie, process.env.ACCESS_TOKEN_SECRET, (err) => {
    if (err) {
      console.error(err);
      return '403';
    }
    return '200';
  });
  return authenticated;
}

function setToken(authenticatedUser) {
  return jwt.sign(authenticatedUser, process.env.ACCESS_TOKEN_SECRET);
}

// Check user existense
async function signInDbQuery(name, pw) {
  const data = await db.checkIn(name);
  if (data) {
    const id = data.user_id;
    const uName = data.user_name;
    if (id && uName) {
      const result = await bcrypt.compare(pw, data.password);
      const authenticatedUser = { id, name: uName };
      if (result) {
        return setToken(authenticatedUser);
      }
      return '401';
    }
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
    if (uName) {
      return '401';
    }
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

// Middleware for sending cookie information to client side
function tokenCheck(authCookie) {
  if (authCookie === null) {
    return '401';
  }
  const token = jwt.verify(authCookie, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.error(err);
      return '403';
    }
    return user;
  });
  return token;
}

// Get user's item lists on the sign in
async function queryList(usrId) {
  const lists = await db.getList(usrId);
  if (lists) {
    return lists;
  }
  return '500';
}

// Save new list
async function newList(usrId, cDate, dDate, item) {
  const listAdded = await db.createList(usrId, cDate, dDate, item);
  if (listAdded === '200') {
    const addedList = await db.getList(usrId);
    if (addedList) {
      return addedList;
    }
  }
  return '500';
}

// Save modified list
async function updatedList(itemId, usrId, dDate, item) {
  const listUpdated = await db.updateList(itemId, usrId, dDate, item);
  if (listUpdated === '200') {
    const updatedLists = await db.getList(usrId);
    if (updatedLists) {
      return updatedLists;
    }
  }
  return '500';
}

// Delete list
async function deletedList(itemId, usrId) {
  const listdeleted = await db.deleteList(itemId, usrId);
  if (listdeleted === '200') {
    const changedList = await db.getList(usrId);
    if (changedList) {
      return changedList;
    }
  }
  return '500';
}

module.exports = {
  checkAuthStatus,
  setToken,
  signInDbQuery,
  signUpDbQuery,
  tokenCheck,
  queryList,
  newList,
  updatedList,
  deletedList,
};