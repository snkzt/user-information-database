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
  it('Check an user authentication status to return string 200 for success', () => {
    // Arrange
    sinon.stub(jwt, 'verify').returns('200');
    // Action
    const result = service.checkAuthStatus('correct_info');
    // Assert
    expect(result).to.equal('200');
  });

  it('Check an user authentication status to return string 403 for failure', () => {
    sinon.stub(jwt, 'verify').returns('403');

    const result = service.checkAuthStatus('incorrect_info');

    expect(result).to.equal('403');
  });

  // Test for function setToken
  it('Check an error as expected on generating an access token', () => {
    sinon.stub(jwt, 'sign').returns(Error());

    const result = service.setToken('tokenise_info');

    expect(result).to.be.an('error');
  });

  // Test for function signInDbQuery
  it('Check data is retrieved from the database and successfully generates an access token', async () => {
    sinon.stub(db, 'checkIn').returns({ user_id: 1, user_name: 'correct_name', password: 'correct_pw' });
    sinon.stub(bcrypt, 'compare').returns(true);
    sinon.stub(jwt, 'sign').returns('accessToken');

    const result = await service.signInDbQuery('correct_name', 'correct_pw');

    expect(result).to.equal('accessToken');
  });

  it('Check an user exists in the database but returning 404 for no matching user as no data retrieved', async () => {
    sinon.stub(db, 'checkIn').returns(null);

    const result = await service.signInDbQuery('incorrect_name', 'incorrect_pw');

    expect(result).to.equal('404');
  });

  it('Check an user exists in the user database and user id is missing from the retrieved data returns 404', async () => {
    sinon.stub(db, 'checkIn').returns({ user_id: null, user_name: 'correct_name', password: 'correct_pw' });

    const result = await service.signInDbQuery('correct_name', 'correct_pw');

    expect(result).to.equal('404');
  });

  it('Check an user exists in the user database and user name is missing from the retrieved data returns 404', async () => {
    sinon.stub(db, 'checkIn').returns({ user_id: 1, user_name: null, password: 'correct_pw' });

    const result = await service.signInDbQuery('correct_name', 'correct_pw');

    expect(result).to.equal('404');
  });

  it('Check the user database retuns error and cause the main function to return 404', async () => {
    sinon.stub(db, 'checkIn').returns(Error());

    const result = await service.signInDbQuery('correct_name', 'correct_pw');

    expect(result).to.equal('404');
  });

  it('Check the mismatch of retrieved password from the database and the inputted returns 401', async () => {
    sinon.stub(db, 'checkIn').returns({ user_id: 1, user_name: 'correct_name', password: 'correct_pw' });
    sinon.stub(bcrypt, 'compare').returns(false);

    const result = await service.signInDbQuery('correct_name', 'incorrect_pw');

    expect(result).to.equal('401');
  });

  // Test for function signUpDbQuery
  it('Check data is retrieved from the database and returns 401', async () => {
    sinon.stub(db, 'checkUp').returns({ user_id: 1, user_name: 'correct_name' });

    const result = await service.signUpDbQuery('correct_name', 'correct_pw');

    expect(result).to.equal('401');
  });

  it('Check data is retrieved from the user database but no user name and returns 500', async () => {
    sinon.stub(db, 'checkUp').returns({ user_id: 1, user_name: null });

    const result = await service.signUpDbQuery('correct_name', 'correct_pw');

    expect(result).to.equal('500');
  });

  it('Check an error returned from user database and returns 500 as a function', async () => {
    sinon.stub(db, 'checkUp').returns(Error());

    const result = await service.signUpDbQuery('correct_name', 'correct_pw');

    expect(result).to.equal('500');
  });

  it('Check new user record created', async () => {
    sinon.stub(db, 'createUser').returns({ user_id: 1, user_name: 'correct_name' });
    sinon.stub(jwt, 'sign').returns('accessToken');

    const result = await service.signUpDbQuery('correct_name', 'correct_pw');

    expect(result).to.equal('accessToken');
  });

  it('Check new user record created but user id not provided and returns 500', async () => {
    sinon.stub(db, 'createUser').returns({ user_id: null, user_name: 'correct_name' });

    const result = await service.signUpDbQuery('correct_name', 'correct_pw');

    expect(result).to.equal('500');
  });

  // Test for function tokenCheck
  it('Check cookie contains token information and returns if it is null', async () => {
    const result = service.tokenCheck(null);

    expect(result).to.equal('401');
  });

  it('Check an inputted sign in information is invalid and emmits error and returns 403', async () => {
    sinon.stub(jwt, 'verify').returns('403');

    const result = service.tokenCheck('incorrect_information');

    expect(result).to.equal('403');
  });

  it('Check an inputted sign in information is valid and returns user information', async () => {
    sinon.stub(jwt, 'verify').returns('user_information');

    const result = service.tokenCheck('correct_information');

    expect(result).to.equal('user_information');
  });

  // Test for function queryList
  it('Check signed in user list retrieved from the database', async () => {
    sinon.stub(db, 'getList').returns('lists');

    const result = await service.queryList('correct_userId');

    expect(result).to.equal('lists');
  });

  it('Check signed in user list retrieved null and returns 500', async () => {
    sinon.stub(db, 'getList').returns(null);

    const result = await service.queryList('correct_userId');

    expect(result).to.equal('500');
  });

  // Test for function newList
  it('Check if newly created list is saved to the database and returns updated lists', async () => {
    sinon.stub(db, 'createList').returns('200');
    sinon.stub(db, 'getList').returns('updated_lists');

    const result = await service.newList(99999, 'createdDate', 'dueDate', 'item');

    expect(result).to.equal('updated_lists');
  });

  it('Check new list failed to be created and returns 500', async () => {
    sinon.stub(db, 'createList').returns(Error());

    const result = await service.newList(99999, 'createdDate', 'dueDate', 'item');

    expect(result).to.equal('500');
  });

  // Test for function updatedList
  it('Check an updated list is saved to the database and returns updated lists', async () => {
    sinon.stub(db, 'updateList').returns('200');
    sinon.stub(db, 'getList').returns('updated_lists');

    const result = await service.newList(99999, 99999, 'dueDate', 'item');

    expect(result).to.equal('updated_lists');
  });

  it('Check updating a list failed and returns 500', async () => {
    sinon.stub(db, 'updateList').returns(Error());

    const result = await service.updatedList(99999, 99999, 'dueDate', 'item');

    expect(result).to.equal('500');
  });

  // Test for function deletedList
  it('Check a list is deleted from the database and returns updated lists', async () => {
    sinon.stub(db, 'deleteList').returns('200');
    sinon.stub(db, 'getList').returns('updated_lists');

    const result = await service.deletedList(99999, 99999);

    expect(result).to.equal('updated_lists');
  });

  it('Check deleting a list failed and returns 500', async () => {
    sinon.stub(db, 'deleteList').returns(Error());

    const result = await service.deletedList(99999, 99999);

    expect(result).to.equal('500');
  });
});
