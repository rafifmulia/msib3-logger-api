const moment = require('moment');
const Validator = require('validatorjs');
const response = require('../config/response');
const LibHelper = require('../library/LibHelper');
const LibPassword = require('../library/LibPassword');
const UsersModels = require('../models/UsersModels');

Validator.useLang('en');
moment.locale('id');

class UsersController {

  async list(req, res) {
    let apiRes = {}
    try {
      const now = moment().unix();
      
      // input validation
      // const input = {
      //   id: req.query.id,
      // };
      // const rulesInput = {
      //   id: 'required|integer|min:1',
      // };
      // const isInputValid = new Validator(input, rulesInput);
      // if (isInputValid.fails()) {
      //   apiRes = JSON.parse(JSON.stringify(response[422]));
      //   apiRes.meta.message = LibHelper.setErrMsg(Object.values(isInputValid.errors.all())[0][0]); // get first message
      //   return res.status(422).json(apiRes);
      // }
      
      const list = await UsersModels.list();
      const newList = [];
      for (const row of list) {
        delete row.paswd;
        newList.push({
          uid: row.id,
          usnme: row.usnme,
          isact: row.isact,
          ctm: row.ctm,
          mtm: row.mtm,
        });
      }

      apiRes = JSON.parse(JSON.stringify(response[200]));
      apiRes.data = newList;
      return res.status(200).json(apiRes);
    } catch (e) {
      apiRes = JSON.parse(JSON.stringify(response[500]));
      apiRes.meta.message += LibHelper.setErrMsg(e.message);
      return res.status(500).json(apiRes);
    }
  }

  async add(req, res) {
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
      apiRes.meta.message = 'user added';
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

  async detail(req, res) {
    let apiRes = {}
    try {
      const now = moment().unix();
      
      // input validation
      const input = {
        uid: req.query.uid,
      };
      const rulesInput = {
        uid: 'required|integer|min:1',
      };
      const isInputValid = new Validator(input, rulesInput);
      if (isInputValid.fails()) {
        apiRes = JSON.parse(JSON.stringify(response[422]));
        apiRes.meta.message = LibHelper.setErrMsg(Object.values(isInputValid.errors.all())[0][0]); // get first message
        return res.status(422).json(apiRes);
      }
      
      const users = await UsersModels.find(req.query.uid);
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

  async updt(req, res) {
    let apiRes = {}
    try {
      const now = moment().unix();

      // input validation
      const input = {
        id: req.body.id,
        usnme: req.body.usnme,
        paswd: req.body.paswd,
        paswd_conf: req.body.paswd_conf,
      };
      const rulesInput = {
        id: 'required|integer|min:1',
        usnme: 'string|max:12',
        paswd: 'string|min:8',
        paswd_conf: 'string|min:8',
      };
      const isInputValid = new Validator(input, rulesInput);
      if (isInputValid.fails()) {
        apiRes = JSON.parse(JSON.stringify(response[422]));
        apiRes.meta.message = LibHelper.setErrMsg(Object.values(isInputValid.errors.all())[0][0]); // get first message
        return res.status(422).json(apiRes);
      }

      const users = await UsersModels.find(req.body.id);
      if (users.length < 1) {
        apiRes = JSON.parse(JSON.stringify(response[404]));
        apiRes.meta.code += '_1';
        apiRes.meta.message = 'account not found';
        return res.status(404).json(apiRes);
      }

      const updt = {
        id: users[0].id,
        mtm: now,
      };

      if (req.body.paswd !== req.body.paswd_conf) {
        apiRes = JSON.parse(JSON.stringify(response[400]));
        apiRes.meta.code += '_1';
        apiRes.meta.message = 'password not same';
        return res.status(400).json(apiRes);
      }

      if (req.body.usnme) {
        updt.usnme = req.body.usnme;
      }
      if (req.body.paswd) {
        updt.paswd = await LibPassword.hashPw(req.body.paswd);
      }
      if (req.body.isact) {
        updt.isact = req.body.isact;
      }

      await UsersModels.update(updt);

      const usersUpdt = await UsersModels.find(users[0].id);
      const profile = {
        uid: usersUpdt[0].id,
        usnme: usersUpdt[0].usnme,
        isact: usersUpdt[0].isact,
        ctm: usersUpdt[0].ctm,
        mtm: usersUpdt[0].mtm,
      };      

      apiRes = JSON.parse(JSON.stringify(response[200]));
      apiRes.meta.message = 'account had been updated';
      apiRes.data = {
        ...profile,
      };
      return res.status(200).json(apiRes);
    } catch (e) {
      apiRes = JSON.parse(JSON.stringify(response[500]));
      apiRes.meta.message += LibHelper.setErrMsg(e.message);
      return res.status(500).json(apiRes);
    }
  }

  async del(req, res) {
    let apiRes = {}
    try {
      const now = moment().unix();

      // input validation
      const input = {
        id: req.body.id,
        usnme: req.body.usnme,
        paswd: req.body.paswd,
        paswd_conf: req.body.paswd_conf,
      };
      const rulesInput = {
        id: 'required|integer|min:1',
        usnme: 'string|max:12',
        paswd: 'string|min:8',
        paswd_conf: 'string|min:8',
      };
      const isInputValid = new Validator(input, rulesInput);
      if (isInputValid.fails()) {
        apiRes = JSON.parse(JSON.stringify(response[422]));
        apiRes.meta.message = LibHelper.setErrMsg(Object.values(isInputValid.errors.all())[0][0]); // get first message
        return res.status(422).json(apiRes);
      }

      const users = await UsersModels.find(req.body.id);
      if (users.length < 1) {
        apiRes = JSON.parse(JSON.stringify(response[404]));
        apiRes.meta.code += '_1';
        apiRes.meta.message = 'account not found';
        return res.status(404).json(apiRes);
      }

      const updt = {
        id: users[0].id,
        dtm: now,
      };

      await UsersModels.update(updt);

      const profile = {
        uid: users[0].id,
        usnme: users[0].usnme,
        isact: users[0].isact,
        ctm: users[0].ctm,
        mtm: users[0].mtm,
      };

      apiRes = JSON.parse(JSON.stringify(response[200]));
      apiRes.meta.message = 'account had been deleted';
      apiRes.data = {
        ...profile,
      }
      return res.status(200).json(apiRes);
    } catch (e) {
      apiRes = JSON.parse(JSON.stringify(response[500]));
      apiRes.meta.message += LibHelper.setErrMsg(e.message);
      return res.status(500).json(apiRes);
    }
  }

}

const object = new UsersController();

module.exports = object;