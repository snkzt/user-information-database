require('dotenv').config();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const db = require('../db/db'); // ../db/db is based on how far from index.js
const jwt = require('jsonwebtoken');
const cookie = require("cookie");

// Check if the user is already authenticated
const routeAccessibility = async (req, res, next) => {
  const authCookie = req.cookies.AccessToken;
  if (authCookie) {
    jwt.verify(authCookie, process.env.ACCESS_TOKEN_SECRET, (err, user) => { // user is a value serialised wich is authenticatedUser
      if (err) return res.sendStatus(403);
      res.redirect('/authenticated');
    });
  } else {  
    next();
  }
};

// Check user existense
const signIn =  async (req, res) => {
  if (req.body.user_name) {
    const name = req.body.user_name;
    const pw = req.body.password;
    const data = await db.checkIn(name);
    if (data) {
      const id = data.user_id
      const uName = data.user_name
      const err = data.err;
      if (id && uName) {
        await bcrypt.compare(pw, data.password).then(async (result) => {
        const authenticatedUser = { id: id, name: uName };
        if (result) {
          const accessToken = await setToken(authenticatedUser);
          res.setHeader("Set-Cookie", cookie.serialize("AccessToken", accessToken,  { httpOnly: true }))
          res.status(200).send({ existing: true });
        } else {
          console.log("Incorrect password");
          res.status(401).send({ existing: true, password: false });
        }
        });
      } else {
        console.error(err);
        res.sendStatus(err.code).send(`${error.name}: ${err.message}`);
      } 
    } else {
      console.log("No record matches");
      res.status(401).send({ existing: false });
    }
  } else {
    console.error(err);
    res.sendStatus(err.code).send(`${error.name}: ${err.message}`);
  }
};

// Create a new user
const signUp = async (req, res) => {
  if (req.body.reg_name) {
    const name = req.body.reg_name;
    const hashedPassword = await bcrypt.hash(req.body.reg_password, saltRounds);
    const data = await db.checkUp(name);

    if (data) {
      const uName = data.user_name;
      const err = data.err;
      if (uName) {
        console.log("User name already taken");
        res.status(401).send({ existing: false, created: false });
      } else {
        console.error(err);
        res.sendStatus(err.code).send(`${error.name}: ${err.message}`);
      }
    } else {
      const dataC = await db.create(name, hashedPassword);
      console.log(message = "1 new record added");
      const authenticatedUser = { id: dataC.user_id, name: dataC.user_name }
      if (dataC) {
        const accessToken = await setToken(authenticatedUser);
        res.setHeader("Set-Cookie", cookie.serialize("AccessToken", accessToken,  { httpOnly: true }))
        res.status(201).send({ existing: false, created: true });
      } else {
        console.log("Register failed")
        res.status(500).send({ existing: false });
      }
    }
  } else {
    console.error(err)
    res.sendStatus(400).send({ existing: err });
  }
};

// Crear Cookie to unable a user to log out
const logOut = async (req, res, next) => {
  res.setHeader("Set-Cookie", cookie.serialize("AccessToken", "",  { httpOnly: true }))
  res.status(200)
  next();
}

async function setToken (authenticatedUser) {
  const accessToken = jwt.sign(authenticatedUser, process.env.ACCESS_TOKEN_SECRET);
  return accessToken;
}

// Middlewear for sending cookie information to client side
function authenticateToken (req, res, next) {
  const authCookie = req.cookies.AccessToken;
  if (authCookie === null) return res.sendStatus(401);
 
  jwt.verify(authCookie, process.env.ACCESS_TOKEN_SECRET, (err, user) => { // user is a value serialised wich is authenticatedUser
    if (err) return res.sendStatus(403)
    req.user = user
    next();
  });
}

module.exports = {
  routeAccessibility,
  signIn,
  signUp,
  logOut,
  authenticateToken
}
