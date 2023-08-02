const jwt = require("jsonwebtoken");
const { sqlForPartialUpdate } = require('./path/to/sqlForPartialUpdate');
const { BadRequestError } = require('../path/to/expressError');
const { SECRET_KEY } = require("../config");


test('sqlForPartialUpdateGood', () => {
    const dataToUpdate = { firstName: 'John', age: 32 };
    const jsToSql = { firstName: 'first_name', age: 'age' };
  
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);
  
    expect(result.setCols).toBe('"first_name"=$1, "age"=$2');
    expect(result.values).toEqual(['John', 32]);
  });
  
  test('sqlForPartialUpdateBad', () => {
    const dataToUpdate = {};
    const jsToSql = { firstName: 'first_name', age: 'age' };
  
    expect(() => {
      sqlForPartialUpdate(dataToUpdate, jsToSql);
    }).toThrow(BadRequestError);
  });
  