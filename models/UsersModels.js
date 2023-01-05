const MysqlHelpers = require(`../library/LibMysqlHelper`);

class UsersModels {

  static IS_INACTIVE = 0;
  static IS_ACTIVE = 1;

  static all() {
    return new Promise(async (resolve, reject) => {
      const query = `SELECT * FROM users;`;
      try {
        const conn = await MysqlHelpers.getDbMysqlConn();
        const result = await MysqlHelpers.query(conn, query);
        resolve(result);
        MysqlHelpers.releaseConnection(conn);
      } catch (e) {
        reject(e);
      }
    });
  }

  static find(id) {
    return new Promise(async (resolve, reject) => {
      const query = `SELECT * FROM users WHERE dtm = 0 AND id = ? LIMIT 1;`;
      try {
        const conn = await MysqlHelpers.createConnection();
        const result = await MysqlHelpers.query(conn, query, [id]);
        resolve(result);
        MysqlHelpers.releaseConnection(conn);
      } catch (e) {
        reject(e);
      }
    });
  }

  static findUser(usnme) {
    return new Promise(async (resolve, reject) => {
      const query = `SELECT * FROM users WHERE dtm = 0 AND usnme = ? LIMIT 1;`;
      try {
        const conn = await MysqlHelpers.createConnection();
        const result = await MysqlHelpers.query(conn, query, [usnme]);
        resolve(result);
        MysqlHelpers.releaseConnection(conn);
      } catch (e) {
        reject(e);
      }
    });
  }

  static list(filter = {}) {
    return new Promise(async (resolve, reject) => {
      let params = [], select = '', where = '', join = '', order_by = '', group_by = '', offset = '', limit = '';

      if (filter['isact']) {
        where += ' AND usr.isact = ?';
        params.push(filter['isact']);
      }

      if (filter['group_by']) {
        group_by = filter['group_by'];
      }
      if (filter['order_by']) {
        order_by = filter['order_by'];
      }
      if (filter['offset']) {
        offset = filter['offset'];
      }
      if (filter['limit']) {
        limit = filter['limit'];
      }

      let query = `SELECT 
      usr.*
      ${select}
      FROM users as usr
      ${join}
      WHERE usr.dtm = 0
      ${where}
      ${group_by}
      ${order_by}
      ${limit} ${offset}
      ;`;
      try {
        const conn = await MysqlHelpers.createConnection();
        const result = await MysqlHelpers.query(conn, query, params);
        resolve(result);
        MysqlHelpers.releaseConnection(conn);
      } catch (e) {
        reject(e);
      }
    });
  }

  static bundleRegis (insUsr = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const conn = await MysqlHelpers.createConnection();
        await MysqlHelpers.createTrx(conn);

        let result = undefined;

        if (Object.keys(insUsr).length > 0) result = await MysqlHelpers.queryTrx(conn, `INSERT INTO users SET ?;`, [insUsr]);

        await MysqlHelpers.commit(conn);

        resolve({
          type: 'success',
          result,
        })
      } catch (err) {
        reject(err);
      }
    })
  }

  static update (updtUsr = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const conn = await MysqlHelpers.createConnection();
        await MysqlHelpers.createTrx(conn);

        let result = undefined;

        if (Object.keys(updtUsr).length > 0) result = await MysqlHelpers.queryTrx(conn, `UPDATE users SET ? WHERE id = ?;`, [updtUsr, updtUsr.id]);

        await MysqlHelpers.commit(conn);

        resolve({
          type: 'success',
          result,
        })
      } catch (err) {
        reject(err);
      }
    })
  }

  static delete (id) {
    return new Promise(async (resolve, reject) => {
      try {
        const conn = await MysqlHelpers.createConnection();
        await MysqlHelpers.createTrx(conn);

        let result = undefined;

        result = await MysqlHelpers.queryTrx(conn, `DELETE FROM users WHERE id = ?;`, [id]);

        await MysqlHelpers.commit(conn);

        resolve({
          type: 'success',
          result,
        })
      } catch (err) {
        reject(err);
      }
    })
  }

}

module.exports = UsersModels;