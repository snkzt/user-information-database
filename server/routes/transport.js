const cookie = require('cookie');

const service = require('./service');

// Check if the user is already authenticated
const routeAccessibility = (req, res, next) => {
  const authCookie = req.cookies.AccessToken;
  if (authCookie) {
    const returnCheckAuth = service.checkAuthStatus(authCookie);
    if (returnCheckAuth === '403') {
      res.sendStatus(403);
    } else if (returnCheckAuth === '200') {
      res.redirect('/authenticated');
    }
  } else {
    next();
  }
};

// Check user existense
const signIn = async (req, res) => {
  if (req.body.user_name) {
    const name = req.body.user_name;
    const pw = req.body.password;
    const token = await service.signInDbQuery(name, pw);
    if (token === '401') {
      console.log('Incorrect password');
      res.status(401).send({ existing: true, password: false });
    } else if (token === '404') {
      console.log('No record matches');
      res.status(401).send({ existing: false });
    } else if (token === '500') {
      console.error('User name input empty');
      res.sendStatus(500).send({ input: false });
    } else if (token) {
      res.setHeader('Set-Cookie', cookie.serialize('AccessToken', token, { httpOnly: true }));
      res.status(200).send({ existing: true });
    } else {
      console.log('Unknown error occured');
      res.sendStatus(500).send({ error: true });
    }
  }
};

// Create a new user
const signUp = async (req, res) => {
  if (req.body.reg_name) {
    const name = req.body.reg_name;
    const pw = req.body.reg_password;
    const createdData = await service.signUpDbQuery(name, pw);
    if (createdData === '401') {
      console.log('User name already taken');
      res.status(401).send({ existing: false, created: false });
    } else if (createdData === '500') {
      console.log('Register failed');
      res.status(500).send({ existing: false });
    } else if (createdData) {
      res.setHeader('Set-Cookie', cookie.serialize('AccessToken', createdData, { httpOnly: true }));
      res.status(201).send({ existing: false, created: true });
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

// Middleware for sending cookie information to client side
function authenticateToken(req, res, next) {
  const authCookie = req.cookies.AccessToken;
  const checkedToken = service.tokenCheck(authCookie);
  if (checkedToken === '401') {
    res.sendStatus(401);
  } else if (checkedToken === '403') {
    res.sendStatus(403);
  } else if (checkedToken) {
    req.user = checkedToken;
    next();
  }
}

// Get user's lists on the sign in
const getList = async (req, res) => {
  const usrId = req.body.id;
  const lists = await service.getListByUser(usrId);
  if (lists === '500') {
    console.log('No list');
    res.status(500).send({ existing: false });
  } else {
    res.status(200).send(lists);
  }
};

// Save new list
const createList = async (req, res) => {
  const usrId = req.body.user_id;
  const cDate = req.body.create_date;
  const dDate = req.body.due_date;
  const { item } = req.body;
  const createdList = await service.createList(usrId, cDate, dDate, item);
  if (createdList === '500') {
    console.log('Save failed');
    res.status(500).send({ existing: false });
  } else if (createdList) {
    console.log('1 new list added');
    res.status(200).send(createdList);
  }
};

// Save updated list
const updateList = async (req, res) => {
  const itemId = req.body.item_id;
  const usrId = req.body.user_id;
  const dDate = req.body.due_date;
  const { item } = req.body;
  const updatedList = service.updateList(itemId, usrId, dDate, item);
  if (updatedList === '500') {
    console.log('Could not retrieve lists');
    res.status(500).send({ existing: false });
  } else if (updatedList) {
    res.status(200).send(updatedList);
  }
};

// Delete list
const deleteList = async (req, res) => {
  const itemId = req.body.item_id;
  const usrId = req.body.user_id;
  const deletedList = service.deleteList(itemId, usrId);
  if (deletedList === '500') {
    console.log('Could not retrieve lists');
    res.status(500).send({ existing: false });
  } else if (deletedList) {
    console.log('1 list deleted');
    res.status(200).send(deletedList);
  }
};

module.exports = {
  routeAccessibility,
  signIn,
  signUp,
  signOut,
  authenticateToken,
  getList,
  createList,
  updateList,
  deleteList,
};
