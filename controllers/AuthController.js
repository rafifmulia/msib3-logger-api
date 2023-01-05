const moment = require('moment');
const Validator = require('validatorjs');
const response = require('../config/response');
const LibHelper = require('../library/LibHelper');
const LibJwt = require('../library/LibJwt');
const LibPassword = require('../library/LibPassword');
const UsersModels = require('../models/UsersModels');

Validator.useLang('en');
moment.locale('id');

class AuthController {

  async regis(req, res) {
    let apiRes = {}
    try {
      const now = moment().unix();

      // input validation
      const input = {
        usnme: req.body.usnme,
        paswd: req.body.paswd,
        paswd_conf: req.body.paswd_conf,
      };
      const rulesInput = {
        usnme: 'required|string|max:12',
        paswd: 'required|string|min:8',
        paswd_conf: 'required|string|min:8',
      };
      const isInputValid = new Validator(input, rulesInput);
      if (isInputValid.fails()) {
        apiRes = JSON.parse(JSON.stringify(response[422]));
        apiRes.meta.message = LibHelper.setErrMsg(Object.values(isInputValid.errors.all())[0][0]); // get first message
        return res.status(422).json(apiRes);
      }

      if (req.body.paswd !== req.body.paswd_conf) {
        apiRes = JSON.parse(JSON.stringify(response[400]));
        apiRes.meta.code += '_1';
        apiRes.meta.message = 'password not same';
        return res.status(400).json(apiRes);
      }

      const ins = {
        usnme: req.body.usnme,
        paswd: await LibPassword.hashPw(req.body.paswd),
        isact: UsersModels.IS_INACTIVE,
        ctm: now,
        mtm: now,
      };
      const resRegis = await UsersModels.bundleRegis(ins);

      apiRes = JSON.parse(JSON.stringify(response[201]));
      apiRes.meta.message = 'account created';
      apiRes.data = {
        uid: resRegis.result.insertId,
      };
      return res.status(201).json(apiRes);
    } catch (e) {
      apiRes = JSON.parse(JSON.stringify(response[500]));
      apiRes.meta.message += LibHelper.setErrMsg(e.message);
      return res.status(500).json(apiRes);
    }
  }

  async login(req, res) {
    let apiRes = {}
    try {
      const now = moment().unix();

      // input validation
      const input = {
        usnme: req.body.usnme,
        paswd: req.body.paswd,
      };
      const rulesInput = {
        usnme: 'required|string|max:12',
        paswd: 'required|string|min:8',
      };
      const isInputValid = new Validator(input, rulesInput);
      if (isInputValid.fails()) {
        apiRes = JSON.parse(JSON.stringify(response[422]));
        apiRes.meta.message = LibHelper.setErrMsg(Object.values(isInputValid.errors.all())[0][0]); // get first message
        return res.status(422).json(apiRes);
      }

      // login
      const users = await UsersModels.findUser(req.body.usnme);
      if (users.length < 1) {
        apiRes = JSON.parse(JSON.stringify(response[404]));
        apiRes.meta.code += '_1';
        apiRes.meta.message = 'account not found';
        return res.status(404).json(apiRes);
      }
      
      const isPaswdValid = await LibPassword.checkPw(users[0].paswd, req.body.paswd);
      if (!isPaswdValid) {
        apiRes = JSON.parse(JSON.stringify(response[400]));
        apiRes.meta.code += '_2';
        apiRes.meta.message = 'password not match';
        return res.status(400).json(apiRes);
      }

      if (users[0].isact !== UsersModels.IS_ACTIVE) {
        apiRes = JSON.parse(JSON.stringify(response[400]));
        apiRes.meta.code += '_3';
        apiRes.meta.message = 'status account inactive';
        return res.status(400).json(apiRes);
      }

      // success response
      const jwt = await LibJwt.createToken({
        uid: users[0].id,
      });

      const profile = {
        uid: users[0].id,
        usnme: users[0].usnme,
        isact: users[0].isact,
        ctm: users[0].ctm,
        mtm: users[0].mtm,
        token: jwt.token,
      };

      apiRes = JSON.parse(JSON.stringify(response[200]));
      apiRes.meta.message = 'success login';
      apiRes.data = profile;
      return res.status(200).json(apiRes);
    } catch (e) {
      apiRes = JSON.parse(JSON.stringify(response[500]));
      apiRes.meta.message += LibHelper.setErrMsg(e.message);
      return res.status(500).json(apiRes);
    }
  }

  async profile(req, res) {
    let apiRes = {}
    try {
      const now = moment().unix();
      const { uid } = req.auth;
      
      const users = await UsersModels.find(uid);
      if (users.length < 1) {
        apiRes = JSON.parse(JSON.stringify(response[404]));
        apiRes.meta.code += '_1';
        apiRes.meta.message = 'account not found, please login again';
        return res.status(404).json(apiRes);
      }
      const profile = {
        uid: users[0].id,
        usnme: users[0].usnme,
        isact: users[0].isact,
        ctm: users[0].ctm,
        mtm: users[0].mtm,
      };

      apiRes = JSON.parse(JSON.stringify(response[200]));
      apiRes.data = profile;
      return res.status(200).json(apiRes);
    } catch (e) {
      apiRes = JSON.parse(JSON.stringify(response[500]));
      apiRes.meta.message += LibHelper.setErrMsg(e.message);
      return res.status(500).json(apiRes);
    }
  }

}

const object = new AuthController();

module.exports = object;