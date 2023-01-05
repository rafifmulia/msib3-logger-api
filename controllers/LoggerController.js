const moment = require('moment');
const Validator = require('validatorjs');
const response = require('../config/response');
const LibCurl = require('../library/LibCurl');
const LibHelper = require('../library/LibHelper');
const LibMail = require('../library/LibMail');
const LogsModels = require('../models/LogsModels');
const LogsKeysModels = require('../models/LogsKeysModels');

Validator.useLang('en');
moment.locale('id');

class LoggerController {

  async log(req, res) {
    let apiRes = {}
    try {
      const now = moment().unix();

      // input validation
      const input = {
        label: req.body.label,
        level: req.body.level,
        logtype: req.body.logtype,
        keys: req.body.keys,
        act: req.body.act,
        to: req.body.to,
        errors: req.body.errors,
        vers: req.body.vers,
        source: req.body.source,
        payloads: req.body.payloads,
      };
      const rulesInput = {
        label: 'required|string|max:145',
        level: 'required|integer|min:1',
        logtype: 'required|in:system,business,input',
        keys: 'required|array',
        act: 'required|in:none,email,sms,call,telegram',
        to: 'array',
        errors: 'string',
        vers: 'required|string',
        source: 'required|in:service,mobile',
        payloads: 'string',
      };
      const isInputValid = new Validator(input, rulesInput);
      if (isInputValid.fails()) {
        apiRes = JSON.parse(JSON.stringify(response[422]));
        apiRes.meta.message = LibHelper.setErrMsg(Object.values(isInputValid.errors.all())[0][0]); // get first message
        return res.status(422).json(apiRes);
      }

      if (req.body.act === 'none' || req.body.act === 'email' || req.body.act === 'telegram') { }
      else {
        apiRes = JSON.parse(JSON.stringify(response[400]));
        apiRes.meta.code += '_1';
        apiRes.meta.message = 'action not available';
        return res.status(400).json(apiRes);
      }

      const ins = {
        label: req.body.label,
        level: req.body.level,
        logtype: req.body.logtype,
        keys: JSON.stringify(req.body.keys),
        act: req.body.act,
        errors: req.body.errors,
        ver: req.body.vers,
        source: req.body.source,
        payload: req.body.payloads || null,
        isact: LogsModels.IS_ACTIVE,
        ctm: now,
        mtm: now,
      };
      ins.to = (req.body.act === 'none') ? null : JSON.stringify(req.body.to);

      const resIns = await LogsModels.bundleLog(ins);

      let receivers = [];
      if (req.body.to) {
        for (let receiver of req.body.to) {
          let sendData = {
            to: receiver,
            label: ins.label,
            logtype: ins.logtype,
            keys: ins.keys,
            ver: ins.ver,
            source: ins.source,
            log_id: resIns.result.insertId,
            errors: '',
          };
          if (ins.level == 1) {
            sendData.level = 'LOW';
          } else if (ins.level == 2) {
            sendData.level = 'MEDIUM';
          } else if (ins.level == 3) {
            sendData.level = 'CRITICAL';
          }
          receivers.push(sendData);
        }
      }

      if (req.body.act === 'email') {
        for (let receiver of receivers) {
          let mailData = {
            ...receiver,
            name: receiver.to.split('@')[0],
          }
          try {
            LibMail.sendInfoLog(ins.label, receiver.to, mailData);
          } catch (ee) {}
        }
      } else if (req.body.act === 'telegram') {
        for (let receiver of receivers) {
          try {
            // https://stackoverflow.com/questions/31908527/php-telegram-bot-insert-line-break-to-text-message
            LibCurl.sendMessage(receiver.to, "\tlabel: "+receiver.label+"\n" + "level: "+receiver.level+"\n" + "logtype: "+receiver.logtype+"\n" + "keys: "+receiver.keys+"\n" + "ver: "+receiver.ver+"\n" + "source: "+receiver.source+"");
          } catch (ee) {}
        }
      }

      apiRes = JSON.parse(JSON.stringify(response[201]));
      apiRes.data = {
        log_id: resIns.result.insertId,
      };
      return res.status(201).json(apiRes);
    } catch (e) {
      apiRes = JSON.parse(JSON.stringify(response[500]));
      apiRes.meta.message += LibHelper.setErrMsg(e.message);
      return res.status(500).json(apiRes);
    }
  }

  async list(req, res) {
    let apiRes = {}
    try {
      const now = moment().unix();

      // input validation
      const input = {
        limit: req.query.limit,
        page: req.query.page,
        keys: req.query.keys,
        level: req.query.level,
        q: req.query.q,
      };
      const rulesInput = {
        limit: 'numeric',
        page: 'numeric',
        keys: 'array',
        level: 'numeric',
        q: 'string|max:45',
      };
      const isInputValid = new Validator(input, rulesInput);
      if (isInputValid.fails()) {
        apiRes = JSON.parse(JSON.stringify(response[422]));
        apiRes.meta.message = LibHelper.setErrMsg(Object.values(isInputValid.errors.all())[0][0]); // get first message
        return res.status(422).json(apiRes);
      }

      input.keys = (typeof input.keys !== 'undefined') ? input.keys : [];

      if (input.q) {
        if (input.q.toLowerCase() === 'low') input.level = 1;
        else if (input.q.toLowerCase() === 'med') input.level = 2;
        else if (input.q.toLowerCase() === 'medium') input.level = 2;
        else if (input.q.toLowerCase() === 'high') input.level = 3;

        if (input.q.indexOf('#code:') === 0) {
          input.id = Number(input.q.split('#code:')[1]);
          input.q = undefined;
        }

        if (input.q.indexOf('#level:') === 0) {
          let level = input.q.split('#level:')[1];
          if (!isNaN(Number(level))) {
            input.level = level;
          } else if (typeof level === 'string') {
            if (level.toLowerCase() === 'low') input.level = 1;
            else if (level.toLowerCase() === 'med') input.level = 2;
            else if (level.toLowerCase() === 'medium') input.level = 2;
            else if (level.toLowerCase() === 'high') input.level = 3;
          }
          input.q = undefined;
        }

        let keyword = '';
        if (input.q.indexOf('#keys:') === 0) keyword = '#keys:';
        if (input.q.indexOf('#tags:') === 0) keyword = '#tags:';
        if (keyword.length > 1) {
          input.keys = [...input.keys, ...input.q.split(keyword)[1].split(',')];
          input.q = undefined;
        }
      }

      const limit = input.limit || 10;
      const filter = {
        id: input.id,
        by_keys: input.keys,
        level: input.level,
        search: input.q,
        isact: LogsModels.IS_ACTIVE,
        order_by: 'lg.id DESC',
        group_by: 'lg.id',
        offset: (input.page > 1) ? (input.page-1) * limit : 0,
        limit: limit,
        recordsTotal: true,
      };

      const list = await LogsModels.list(filter), newList = [];
      let recordsTotal = 0;
      for (const row of list) {
        row.ctm_server = moment.unix(row.ctm).format('DD-MM-YYYY HH:mm:ss');
        row.mtm_server = moment.unix(row.mtm).format('DD-MM-YYYY HH:mm:ss');
        if (recordsTotal < 1) recordsTotal = row.recordsTotal;
        delete row.recordsTotal;
        newList.push({
          ...row
        });
      }

      const pagination = [];
      if (recordsTotal > 0) {
        const pagiLength = Math.ceil(recordsTotal / limit);
        for (let i=1; i<=pagiLength; i++) {
          pagination.push(i);
        }
      }

      apiRes = JSON.parse(JSON.stringify(response[200]));
      apiRes.data = {
        count: newList.length,
        list: newList,
        pagination,
        activePage: (req.query.page < 1) ? 1 : req.query.page,
        recordsTotal,
      };
      return res.status(200).json(apiRes);
    } catch (e) {
      apiRes = JSON.parse(JSON.stringify(response[500]));
      apiRes.meta.message += LibHelper.setErrMsg(e.message);
      return res.status(500).json(apiRes);
    }
  }

  async sum_keys(req, res) {
    let apiRes = {}
    try {
      const now = moment().unix();

      // input validation
      const input = {
        limit: req.query.limit,
      };
      const rulesInput = {
        limit: 'numeric',
      };
      const isInputValid = new Validator(input, rulesInput);
      if (isInputValid.fails()) {
        apiRes = JSON.parse(JSON.stringify(response[422]));
        apiRes.meta.message = LibHelper.setErrMsg(Object.values(isInputValid.errors.all())[0][0]); // get first message
        return res.status(422).json(apiRes);
      }

      const filter = {
        limit: req.query.limit || false,
        isact: LogsKeysModels.IS_ACTIVE,
        order_by: 'lgk.id DESC',
        group_by: 'lgk.log_key',
        count_keys: true,
      };
      const list = await LogsKeysModels.list(filter);
      const newList = [];
      for (const row of list) {
        newList.push({
          log_key: row.log_key,
          count: row.count_key,
        })
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

}

const object = new LoggerController();

module.exports = object;