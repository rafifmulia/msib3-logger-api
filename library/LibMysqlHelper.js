const db = require(`../config/dbMysqlConn`);
const Promise = require("bluebird");

class MysqlHelpers {
  static async insert (table, data) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO ${table} SET ?;`;
      db.getConnection(function (err, conn) {
        if (err) {
          conn.release();
          reject(err);
          return false;
        }
        conn.beginTransaction(async function (err) {
          if (err) {
            conn.release();
            reject(err);
            return false;
          }
          conn.query(query, data, function (err, result) {
            if (err) {
              conn.rollback(async function () {
                conn.release();
                reject(err);
              });
              return false;
            }
            // Number(result.insertId);
            conn.commit(async function (err) {
              if (err) {
                conn.release();
                reject(err);
                return false;
              }
              conn.release();
              resolve(result);
              return true;
            });
          });
        });

      });
    })
  }
  static async update (table, data, colId, valId) {
    return new Promise((resolve, reject) => {
      const query = `UPDATE ${table} SET ? WHERE ${colId} = ?;`;
      db.getConnection(function (err, conn) {
        if (err) {
          conn.release();
          reject(err);
          return false;
        }
        conn.beginTransaction(async function (err) {
          if (err) {
            conn.release();
            reject(err);
            return false;
          }
          conn.query(query, [data, valId], function (err, result) {
            if (err) {
              conn.rollback(async function () {
                conn.release();
                reject(err);
              });
              return false;
            }
            conn.commit(async function (err) {
              if (err) {
                conn.release();
                reject(err);
                return false;
              }
              conn.release();
              resolve(result);
              return true;
            });
          });
        });

      });
    })
  }
  static async delete (table, colId, valId) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM ${table} WHERE ${colId} = ?;`;
      db.getConnection(function (err, conn) {
        if (err) {
          conn.release();
          reject(err);
          return false;
        }
        conn.beginTransaction(async function (err) {
          if (err) {
            conn.release();
            reject(err);
            return false;
          }
          conn.query(query, [valId], function (err, result) {
            if (err) {
              conn.rollback(async function () {
                conn.release();
                reject(err);
              });
              return false;
            }
            conn.commit(async function (err) {
              if (err) {
                conn.release();
                reject(err);
                return false;
              }
              conn.release();
              resolve(result);
              return true;
            });
          });
        });

      });
    })
  }
  static async createConnection () {
    return new Promise((resolve, reject) => {
      db.getConnection(function (err, conn) {
        if (err) {
          if (conn) conn.release();
          reject(err);
          return false;
        }
        resolve(conn);
      });
    })
  }
  static async getDbMysqlConn () {
    return new Promise((resolve, reject) => {
      resolve(db);
    })
  }
  static async releaseConnection (conn) {
    return new Promise((resolve, reject) => {
      if (conn) conn.release();
      resolve(true);
    })
  }
  static async createTrx (conn) {
    return new Promise((resolve, reject) => {
      conn.beginTransaction(async function (err) {
        if (err) {
          conn.release();
          reject(err);
          return false;
        }
        resolve(conn);
      });
    })
  }
  static async queryTrx (conn, query = '', params = []) {
    return new Promise((resolve, reject) => {
      conn.query(query, params, function (err, result) {
        if (err) {
          conn.rollback(async function () {
            conn.release();
            reject(err);
          });
          return false;
        }
        // Number(result.insertId);
        resolve(result);
      });
    })
  }
  static async query (conn, query = '', params = []) {
    return new Promise((resolve, reject) => {
      conn.query(query, params, function (err, result) {
        if (err) return reject(err);
        // Number(result.insertId);
        resolve(result);
      });
    })
  }
  static async commit (conn) {
    return new Promise((resolve, reject) => {
      conn.commit(async function (err) {
        if (err) {
          conn.release();
          reject(err);
          return false;
        }
        conn.release();
        resolve(true);
      });
    })
  }
  static async rollback (conn) {
    return new Promise((resolve, reject) => {
      conn.rollback(async function () {
        conn.release();
        reject(err);
      });
      return false;
    })
  }
}

module.exports = MysqlHelpers;