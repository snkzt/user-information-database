const { assert } = require('chai');
const logic = require('./server/routes/logic');

describe('Check authenticated user accessibility to routes', () => {
  it('Authenticated user ', () => {
    assert.isString(logic.routeAccessibility(), 'string');
  });

  it('test not authentivated', () => {

  });
});

{
  routeAccessibility,
  setToken,
  routeAccessibility,
  signIn,
  signUp,
  signOut,
  authenticateToken,
  getList,
  createList,
  updateList,
  deleteList;
}
