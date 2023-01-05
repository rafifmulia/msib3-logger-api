const MysqlHelpers = require(`../library/LibMysqlHelper`);

class LogsModels {

  static IS_INACTIVE = 0;
  static IS_ACTIVE = 1;

  static all() {
    return new Promise(async (resolve, reject) => {
      const query = `SELECT * FROM logs;`;
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
      const query = `SELECT * FROM logs WHERE dtm = 0 AND id = ? LIMIT 1;`;
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
      let params = [], paramsSubquery = [], select = '', where = '', join = '', order_by = '', group_by = '', offset = '', limit = '';

      if (filter['id']) {
        where += ' AND lg.id = ?';
        params.push(filter['id']);
      }
      if (filter['isact']) {
        where += ' AND lg.isact = ?';
        params.push(filter['isact']);
      }
      if (filter['level']) {
        where += ' AND lg.level = ?';
        params.push(filter['level']);
      }

      if (filter['by_keys']) {
        join += ' INNER JOIN logs_keys as lgk ON lg.id = lgk.log_id';
        let keys = '';
        for (let key of filter['by_keys']) {
          if (key.length < 1) continue;
          keys += '?,';
          params.push(key);
        }
        keys = keys.slice(0, -1);
        if (keys.length > 0) where += ' AND lgk.log_key IN (' + keys + ')';
      }

      if (filter['search']) {
        let q = '%'+filter['search']+'%';
        where += ' AND (lg.label LIKE ? OR lg.logtype LIKE ? OR lg.act LIKE ? OR lg.errors LIKE ? OR lg.ver LIKE ? OR lg.source LIKE ? OR lg.payload LIKE ? OR lg.keys LIKE ?)';
        params.push(q, q, q, q, q, q, q, q);
      }

      if (filter['recordsTotal']) {
        select += ' ,(SELECT COUNT(lg1.id) FROM logs as lg1';
        if (filter['by_keys']) {
          select += ' INNER JOIN logs_keys as lgk1 ON lg1.id = lgk1.log_id';
          let keys = '';
          for (let key of filter['by_keys']) {
            if (key.length < 1) continue;
            keys += '?,';
            paramsSubquery.push(key);
          }
          keys = keys.slice(0, -1);
          if (keys.length > 0) select += ' AND lgk1.log_key IN (' + keys + ')';
        }
        select += ' WHERE lg1.dtm = 0';
        if (filter['id']) {
          select += ' AND lg1.id = ?';
          paramsSubquery.push(filter['id']);
        }
        if (filter['isact']) {
          select += ' AND lg1.isact = ?';
          paramsSubquery.push(filter['isact']);
        }
        if (filter['level']) {
          select += ' AND lg1.level = ?';
          paramsSubquery.push(filter['level']);
        }
        if (filter['search']) {
          let q = '%'+filter['search']+'%';
          select += ' AND (lg1.label LIKE ? OR lg1.logtype LIKE ? OR lg1.act LIKE ? OR lg1.errors LIKE ? OR lg1.ver LIKE ? OR lg1.source LIKE ? OR lg1.payload LIKE ? OR lg1.keys LIKE ?)';
          paramsSubquery.push(q, q, q, q, q, q, q, q);
        }
        select += ') as recordsTotal';
      }

      if (filter['group_by']) group_by = 'GROUP BY ' + filter['group_by'];
      if (filter['order_by']) order_by = 'ORDER BY ' + filter['order_by'];
      if (filter['offset']) offset = 'OFFSET ' + filter['offset'];
      if (filter['limit']) limit = 'LIMIT ' + filter['limit'];

      params = [...paramsSubquery, ...params];

      let query = `SELECT 
      lg.*, lv.val as level_name
      ${select}
      FROM logs as lg
      LEFT JOIN levels as lv ON lg.level = lv.key
      ${join}
      WHERE lg.dtm = 0
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

  static bundleLog (insLog = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const conn = await MysqlHelpers.createConnection();
        await MysqlHelpers.createTrx(conn);

        let result = undefined;

        if (Object.keys(insLog).length > 0) {
          result = await MysqlHelpers.queryTrx(conn, `INSERT INTO logs SET ?;`, [insLog]);
          let keys = JSON.parse(insLog.keys);
          for (let key of keys) {
            let row = {
              log_id: result.insertId,
              log_key: key,
              isact: insLog.isact,
              ctm: insLog.ctm,
              mtm: insLog.mtm,
            };
            await MysqlHelpers.queryTrx(conn, `INSERT INTO logs_keys SET ?;`, [row]);
          }
        }

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

        if (Object.keys(updtUsr).length > 0) result = await MysqlHelpers.queryTrx(conn, `UPDATE logs SET ? WHERE id = ?;`, [updtUsr, updtUsr.id]);

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

        result = await MysqlHelpers.queryTrx(conn, `DELETE FROM logs WHERE id = ?;`, [id]);

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

module.exports = LogsModels;