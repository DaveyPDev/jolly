const { BadRequestError } = require("../expressError");

/**
 * Generates the SQL query string and values for a partial update based on the provided data object.
 *
 * Given an object representing data to update and a mapping object that translates
 * JavaScript-style keys to corresponding SQL column names, this function returns an object
 * containing the SQL set clause and the corresponding values to be updated.
 *
 * If the dataToUpdate object is empty, the function will throw a BadRequestError.
 *
 * @param {Object} dataToUpdate - The data object containing the key-value pairs to update in the database.
 * @param {Object} jsToSql - The mapping object that translates JavaScript-style keys to SQL column names.
 * @returns {Object} An object containing the SQL set clause and the corresponding values to be updated.
 * @throws {BadRequestError} When the dataToUpdate object is empty.
 *
 * @example
 *  Example usage:
 * const dataToUpdate = { firstName: 'John', lastName: 'Doe', age: 30 };
 * const jsToSql = { firstName: 'first_name', lastName: 'last_name', age: 'age' };
 * const { setCols, values } = sqlForPartialUpdate(dataToUpdate, jsToSql);
 * setCols will be: `"first_name"=$1, "last_name"=$2, "age"=$3`
 * values will be: ['John', 'Doe', 30]
 */


function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'John', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
