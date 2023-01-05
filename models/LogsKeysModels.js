const MysqlHelpers = require(`../library/LibMysqlHelper`);

class LogsKeysModels {

  static IS_INACTIVE = 0;
  static IS_ACTIVE = 1;

  static all() {
    return new Promise(async (resolve, reject) => {
      const query = `SELECT * FROM logs_keys;`;
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
      const query = `SELECT * FROM logs_keys WHERE dtm = 0 AND id = ? LIMIT 1;`;
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

  static list(filter = {}) {
    return new Promise(async (resolve, reject) => {
      let params = [], select = '', where = '', join = '', order_by = '', group_by = '', offset = '', limit = '';

      if (filter['isact']) {
        where += ' AND lgk.isact = ?';
        params.push(filter['isact']);
      }

      if (filter['count_keys']) {
       select += ',COUNT(lgk.log_key) as count_key';
      }

      if (filter['group_by']) group_by = 'GROUP BY ' + filter['group_by'];
      if (filter['order_by']) order_by = 'ORDER BY ' + filter['order_by'];
      if (filter['offset']) offset = 'OFFSET ' + filter['offset'];
      if (filter['limit']) limit = 'LIMIT ' + filter['limit'];

      let query = `SELECT 
      lgk.*
      ${select}
      FROM logs_keys as lgk
      ${join}
      WHERE lgk.dtm = 0
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

  static insert (ins = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const conn = await MysqlHelpers.createConnection();
        await MysqlHelpers.createTrx(conn);

        let result = undefined;

        if (Object.keys(ins).length > 0) result = await MysqlHelpers.queryTrx(conn, `INSERT INTO logs_keys SET ?;`, [ins]);

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

        if (Object.keys(updtUsr).length > 0) result = await MysqlHelpers.queryTrx(conn, `UPDATE logs_keys SET ? WHERE id = ?;`, [updtUsr, updtUsr.id]);

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

        result = await MysqlHelpers.queryTrx(conn, `DELETE FROM logs_keys WHERE id = ?;`, [id]);

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

module.exports = LogsKeysModels;