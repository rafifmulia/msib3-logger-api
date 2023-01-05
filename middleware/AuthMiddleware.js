const response = require('../config/response');
const LibHelper = require('../library/LibHelper');
const LibJwt = require('../library/LibJwt');
const UsersModels = require('../models/UsersModels');

class AuthMiddleware {
  static async initialize(req, res, next) {
    let apiRes = {};
    try {
      const tokenData = await LibJwt.verifyToken(req.headers['x-api-key']);
      if (tokenData.type !== 'success') {
        apiRes = JSON.parse(JSON.stringify(response[401]));
        apiRes.meta.message += LibHelper.setErrMsg(': ' + tokenData.message);
        return res.status(401).json(apiRes);
      }
      const users = UsersModels.find(tokenData.uid);
      if (users.length < 1) {
        apiRes = JSON.parse(JSON.stringify(response[401]));
        apiRes.meta.message += LibHelper.setErrMsg(': account not found, please login again');
        return res.status(401).json(apiRes);
      }
      req.auth = JSON.parse(JSON.stringify(tokenData.data));
      next();
    } catch (e) {
      apiRes = JSON.parse(JSON.stringify(response[401]));
      apiRes.meta.message += LibHelper.setErrMsg(': ' + e.message);
      return res.status(401).json(apiRes);
    }
  }
}

module.exports = AuthMiddleware.initialize;