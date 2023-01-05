const url = require('url');
const axios = require('axios').default;

const { TELE_BOT_TOKEN, TELE_BOT_API_PREFIX } = process.env;

class LibCurl {
  
  static getUpdates() {
    return new Promise(async (resolve, reject) => {
      try {
        const axInstance = axios.create();
        axios.defaults.timeout = 3000;
        axios.defaults.crossDomain = true;
        let teleUrl = `${TELE_BOT_API_PREFIX}${TELE_BOT_TOKEN}/getUpdates`;
        let resp = await axInstance.get(teleUrl);
        resolve({
          type: 'sc',
          resp: resp.data,
        });
      } catch (e) {
        reject(e);
      }
    });
	}

  static sendMessage(chat_id, text) {
    return new Promise(async (resolve, reject) => {
      try {
        let payload = new url.URLSearchParams();
        payload.append('chat_id', chat_id);
        payload.append('text', text);
        const axInstance = axios.create();
        axios.defaults.timeout = 3000;
        axios.defaults.crossDomain = true;
        let teleUrl = `${TELE_BOT_API_PREFIX}${TELE_BOT_TOKEN}/sendMessage`;
        let resp = await axInstance.post(teleUrl, payload, {
          headers: {
            'content-type': 'application/x-www-form-urlencoded'
          },
        });
        resolve({
          type: 'sc',
          resp: resp.data,
        });
      } catch (e) {
        reject(e);
      }
    });
	}

}

module.exports = LibCurl;