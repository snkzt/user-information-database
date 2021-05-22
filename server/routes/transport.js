require('dotenv').config();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const db = require('../db/db'); 

// Check if the user is already authenticated
const routeAccessibility = async (req, res, next) => {
  const authCookie = req.cookies.AccessToken;
  if (authCookie) {
    jwt.verify(authCookie, process.env.ACCESS_TOKEN_SECRET, (err) => {
      if (err) {
        console.log(err);
        return res.sendStatus(403);
      }
      res.redirect('/authenticated');
    });
  } else {
    next();
  }
};

// // Check if the user is already authenticated
// const routeAccessibility = async (req, res, next) => {
//   const authCookie = req.cookies.AccessToken;
//   if (authCookie) {
//     jwt.verify(authCookie, process.env.ACCESS_TOKEN_SECRET, (err) => {
//       if (err) {
//         console.log(err);
//         return res.sendStatus(403);
//       }
//       res.redirect('/authenticated');
//     });
//   } else {
//     next();
//   }
// };

// Check user existense
const signIn = async (req, res) => {
  if (req.body.user_name) {
    const name = req.body.user_name;
    const pw = req.body.password;
    const data = await db.checkIn(name);
    if (data) {
      const id = data.user_id;
      const uName = data.user_name;
      const { err } = data;
      if (id && uName) {
        await bcrypt.compare(pw, data.password).then(async (result) => {
          const authenticatedUser = { id, name: uName };
          if (result) {
            const accessToken = await setToken(authenticatedUser);
            res.setHeader('Set-Cookie', cookie.serialize('AccessToken', accessToken, { httpOnly: true }));
            res.status(200).send({ existing: true });
          } else {
            console.log('Incorrect password');
            res.status(401).send({ existing: true, password: false });
          }
        });
      } else {
        console.error(err);
        res.sendStatus(err.code).send(`${err.name}: ${err.message}`);
      }
    } else {
      console.log('No record matches');
      res.status(401).send({ existing: false });
    }
  } else {
    console.error('User name input empty');
    res.sendStatus(400).send({ input: false });
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
      const { err } = data;
      if (uName) {
        console.log('User name already taken');
        res.status(401).send({ existing: false, created: false });
      } else {
        console.error(err);
        res.sendStatus(err.code).send(`${err.name}: ${err.message}`);
      }
    } else {
      const dataC = await db.createUser(name, hashedPassword);
      console.log('1 new user added');
      const authenticatedUser = { id: dataC.user_id, name: dataC.user_name };
      if (dataC.user_id) {
        const accessToken = await setToken(authenticatedUser);
        res.setHeader('Set-Cookie', cookie.serialize('AccessToken', accessToken, { httpOnly: true }));
        res.status(201).send({ existing: false, created: true });
      } else {
        console.log('Register failed');
        res.status(500).send({ existing: false });
      }
    }
  } else {
    console.error('User name input empty');
    res.sendStatus(400).send({ input: false });
  }
};

// Crear Cookie to unable a user to sign out
const signOut = async (req, res, next) => {
  res.setHeader('Set-Cookie', cookie.serialize('AccessToken', '', { httpOnly: true }));
  res.status(200);
  next();
};

async function setToken(authenticatedUser) {
  const accessToken = jwt.sign(authenticatedUser, process.env.ACCESS_TOKEN_SECRET);
  return accessToken;
}

// Middlewear for sending cookie information to client side
function authenticateToken(req, res, next) {
  const authCookie = req.cookies.AccessToken;
  if (authCookie === null) return res.sendStatus(401);

  jwt.verify(authCookie, process.env.ACCESS_TOKEN_SECRET, (err, user) => { // user is a value serialised wich is authenticatedUser
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Get user's lists on the sign in
const getList = async (req, res) => {
  const usrId = req.body.id;
  const lists = await db.getList(usrId);

  if (lists) {
    res.lists = lists;
    res.status(200).send(res.lists);
  } else {
    console.log('Could not retrieve lists');
    res.status(500).send({ existing: false });
  }
};

// Save new list
const createList = async (req, res) => {
  const usrId = req.body.user_id;
  const cDate = req.body.create_date;
  const dDate = req.body.due_date;
  const { item } = req.body;
  await db.createList(usrId, cDate, dDate, item);
  const newList = await db.getList(usrId);

  if (newList) {
    console.log('1 new list added');
    res.list = newList;
    res.status(200).send(res.list);
  } else {
    console.log('Save failed');
    res.status(500).send({ existing: false });
  }
};

// Save updated list
const updateList = async (req, res) => {
  const itemId = req.body.item_id;
  const usrId = req.body.user_id;
  const dDate = req.body.due_date;
  const { item } = req.body;
  await db.updateList(itemId, usrId, dDate, item);
  const updatedList = await db.getList(usrId);

  if (updatedList) {
    res.lists = updatedList;
    res.status(200).send(res.lists);
  } else {
    console.log('Could not retrieve lists');
    res.status(500).send({ existing: false });
  }
};

// Save updated list
const deleteList = async (req, res) => {
  const itemId = req.body.item_id;
  const usrId = req.body.user_id;
  await db.deleteList(itemId, usrId);
  const deletedList = await db.getList(usrId);

  if (deletedList) {
    console.log('1 list deleted');
    res.lists = deletedList;
    res.status(200).send(res.lists);
  } else {
    console.log('Could not retrieve lists');
    res.status(500).send({ existing: false });
  }
};

module.exports = {
  routeAccessibility,
  setToken,
  signIn,
  signUp,
  signOut,
  authenticateToken,
  getList,
  createList,
  updateList,
  deleteList
};
