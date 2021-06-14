const chai = require('chai');

const { expect } = chai;
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const service = require('./service');

const db = require('../db/db');

describe('Serivice layer unit test', () => {
  afterEach(() => {
    sinon.restore();
  });

  // Test for function checkAuthStatus
  it('Should return string 200 for success', () => {
    // Arrange
    sinon.stub(jwt, 'verify').withArgs('correct_info').returns('200');
    // Action
    const result = service.checkAuthStatus('correct_info');
    // Assert
    expect(result).to.equal('200');
  });

  it('Should return string 403 for failure', () => {
    sinon.stub(jwt, 'verify').withArgs('incorrect_info').returns('403');

    const result = service.checkAuthStatus('incorrect_info');

    expect(result).to.equal('403');
  });

  // Test for function setToken
  it('Should retunrn an error for jwt.sign returns an error', () => {
    sinon.stub(jwt, 'sign').returns(new Error());

    const result = service.setToken('tokenise_info');

    expect(result).to.be.an('error');
  });

  // Test for function signInDbQuery
  it('Should successfully generate an access token', async () => {
    sinon.stub(db, 'checkIn').withArgs('correct_name').returns({ user_id: 9999, user_name: 'correct_name', password: 'correct_pw' });
    sinon.stub(bcrypt, 'compare').returns(true);
    sinon.stub(jwt, 'sign').returns('accessToken');

    const result = await service.signInDbQuery('correct_name', 'correct_pw');

    expect(result).to.equal('accessToken');
  });

  it('Should return 404 for no matching user as no data retrieved', async () => {
    sinon.stub(db, 'checkIn').returns(undefined);

    const result = await service.signInDbQuery('incorrect_name', 'incorrect_pw');

    expect(result).to.equal('404');
  });

  it('Should return 500 for missing user id from the retrieved data', async () => {
    sinon.stub(db, 'checkIn').returns({ user_id: null, user_name: 'correct_name', password: 'correct_pw' });

    const result = await service.signInDbQuery('correct_name', 'correct_pw');

    expect(result).to.equal('500');
  });

  it('Should return 500 for missing user name from the retrieved data', async () => {
    sinon.stub(db, 'checkIn').returns({ user_id: 9999, user_name: null, password: 'correct_pw' });

    const result = await service.signInDbQuery('correct_name', 'correct_pw');

    expect(result).to.equal('500');
  });

  it('Should return 500', async () => {
    sinon.stub(db, 'checkIn').returns(new Error());

    const result = await service.signInDbQuery('correct_name', 'correct_pw');

    expect(result).to.equal('500');
  });

  it('Should return 401 for the mismatch of passwords on the database and the one inputted by an user', async () => {
    sinon.stub(db, 'checkIn').returns({ user_id: 9999, user_name: 'correct_name', password: 'correct_pw' });
    sinon.stub(bcrypt, 'compare').returns(false);

    const result = await service.signInDbQuery('correct_name', 'incorrect_pw');

    expect(result).to.equal('401');
  });

  // Test for function signUpDbQuery
  it('Should return 500 for an error from the database', async () => {
    sinon.stub(db, 'checkUp').returns(new Error());

    const result = await service.signUpDbQuery('correct_name', 'correct_pw');

    expect(result).to.equal('500');
  });

  it('Should return 401 for user already exists and cannot create a new one with the same user name and the password pair', async () => {
    sinon.stub(db, 'checkUp').returns({ user_id: 9999, user_name: 'correct_name' });

    const result = await service.signUpDbQuery('correct_name', 'correct_pw');

    expect(result).to.equal('401');
  });

  it('Should return access token', async () => {
    sinon.stub(db, 'createUser').returns({ user_id: 9999, user_name: 'nonexisting_name' });
    sinon.stub(jwt, 'sign').returns('accessToken');

    const result = await service.signUpDbQuery('nonexisting_name', 'nonexisting_pw');

    expect(result).to.equal('accessToken');
  });

  it('Should return 500 and fail creating new user for null user name', async () => {
    sinon.stub(db, 'createUser').returns({ user_id: 9999, user_name: null });

    const result = await service.signUpDbQuery('nonexisting_name', 'nonexisting_pw');

    expect(result).to.equal('500');
  });

  it('Should return 500 and fail creating new user for null user id', async () => {
    sinon.stub(db, 'createUser').returns({ user_id: null, user_name: 'nonexisting_name' });

    const result = await service.signUpDbQuery('nonexisting_name', 'nonexisting_pw');

    expect(result).to.equal('500');
  });

  // Test for function tokenCheck
  it('Should return 401 for null cookie', async () => {
    const result = service.tokenCheck(null);

    expect(result).to.equal('401');
  });

  it('Should return 403 for invalid user input', async () => {
    sinon.stub(jwt, 'verify').withArgs('incorrect_information').returns('403');

    const result = service.tokenCheck('incorrect_information');

    expect(result).to.equal('403');
  });

  it('Should return user information for valid sign in user input', async () => {
    sinon.stub(jwt, 'verify').withArgs('correct_information').returns('user_information');

    const result = service.tokenCheck('correct_information');

    expect(result).to.equal('user_information');
  });

  // Test for function getListByUser
  it('Should return item lists for the valid user id', async () => {
    sinon.stub(db, 'getList').returns(['correct','updated','list']);

    const result = await service.getListByUser('correct_userId');

    expect(result).to.be.an('array');
    expect(result).to.have.lengthOf(3);
    expect(result).to.deep.equal(['correct', 'updated', 'list']);
  });

  it('Should return 500 for no list retrieved from the database', async () => {
    sinon.stub(db, 'getList').returns([]);

    const result = await service.getListByUser('correct_userId');

    expect(result).to.be.an('array');
    expect(result).to.have.lengthOf(0);
  });

  // Test for function createist
  it('Should return lists', async () => {
    sinon.stub(db, 'createList').returns('200');
    sinon.stub(db, 'getList').returns(['correct','updated','list']);

    const result = await service.createList(99999, 'createdDate', 'dueDate', 'item');

    expect(result).to.be.an('array');
    expect(result).to.have.lengthOf(3);
    expect(result).to.deep.equal(['correct', 'updated', 'list']);
  });

  it('Should return 500 for failure of creating new list', async () => {
    sinon.stub(db, 'createList').returns(new Error());

    const result = await service.createList(99999, 'createdDate', 'dueDate', 'item');

    expect(result).to.equal('500');
  });

  // Test for function updateList
  it('Should return updated lists', async () => {
    sinon.stub(db, 'updateList').returns('200');
    sinon.stub(db, 'getList').returns(['correct','updated','list']);

    const result = await service.createList(99999, 99999, 'dueDate', 'item');

    expect(result).to.be.an('array');
    expect(result).to.have.lengthOf(3);
    expect(result).to.deep.equal(['correct', 'updated', 'list']);
  });

  it('Should return 500 for Error returned for failed database task', async () => {
    sinon.stub(db, 'updateList').returns(new Error());

    const result = await service.updateList(99999, 99999, 'dueDate', 'item');

    expect(result).to.equal('500');
  });

  // Test for function deleteList
  it('Should return updated lists for successful database task', async () => {
    sinon.stub(db, 'deleteList').returns('200');
    sinon.stub(db, 'getList').returns(['correct', 'updated', 'list']);

    const result = await service.deleteList(99999, 99999);

    expect(result).to.be.an('array');
    expect(result).to.have.lengthOf(3);
    expect(result).to.deep.equal(['correct', 'updated', 'list']);
  });

  it('Should return 500 for failed database task', async () => {
    sinon.stub(db, 'deleteList').returns(new Error());

    const result = await service.deleteList(99999, 99999);

    expect(result).to.equal('500');
  });
});
