const moment = require('moment');
const Validator = require('validatorjs');
const response = require('../config/response');
const LibCurl = require('../library/LibCurl');
const LibHelper = require('../library/LibHelper');

Validator.useLang('en');
moment.locale('id');

class TelegramController {

  async recentChats(req, res) {
    let apiRes = {}
    try {
      const now = moment().unix();

      // input validation
      // const input = {};
      // const rulesInput = {};
      // const isInputValid = new Validator(input, rulesInput);
      // if (isInputValid.fails()) {
      //   apiRes = JSON.parse(JSON.stringify(response[422]));
      //   apiRes.meta.message = LibHelper.setErrMsg(Object.values(isInputValid.errors.all())[0][0]); // get first message
      //   return res.status(422).json(apiRes);
      // }

      let recentChats = await LibCurl.getUpdates();
      if (recentChats.type != 'sc') {
        apiRes = JSON.parse(JSON.stringify(response[400]));
        apiRes.meta.code += '_1';
        apiRes.meta.message = 'fail get recent chats';
        return res.status(400).json(apiRes);
      }

      if (!recentChats.resp.ok) {
        apiRes = JSON.parse(JSON.stringify(response[400]));
        apiRes.meta.code += '_2';
        apiRes.meta.message = 'fail get recent chats from telegram';
        return res.status(400).json(apiRes);
      }

      apiRes = JSON.parse(JSON.stringify(response[200]));
      apiRes.data = [
        ...recentChats.resp.result.reverse(),
      ]
      return res.status(200).json(apiRes);
    } catch (e) {
      apiRes = JSON.parse(JSON.stringify(response[500]));
      apiRes.meta.message += LibHelper.setErrMsg(e.message);
      return res.status(500).json(apiRes);
    }
  }

}

const object = new TelegramController();

module.exports = object;