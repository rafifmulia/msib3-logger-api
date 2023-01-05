const jwt = require('jsonwebtoken');
const cryptojs = require("crypto-js");

const confJwt = {
  algorithm: 'HS256',
  issuer: 'SERVICE_LOGGER',
  subject: 'LOGGER',
  audience: 'SERVICES',
  expiresIn: '1m',
};
const SECRET_KEY = 'Xn2r5u8x'; // like password
const KEY_ENC = 'dRgUjXn2r5u8x/A?D(G+KbPeShVmYp3s'; // just random string

class LibJwt {

  static async createToken(data) {
    return new Promise((resolve, reject) => {
      // mengapa data perlu di enc lagi ? karena di jwt data tersebut hanya di base64_enc
      let cipherText = cryptojs.AES.encrypt(JSON.stringify(data), KEY_ENC).toString();
      let payload = {
        cipherText,
      };

      jwt.sign(payload, SECRET_KEY, confJwt, function (err, token) {
        if (err) {
          reject(err);
          return false;
        }
        resolve({ type: 'success', token });
      })
    })
  }

  static async verifyToken(token) {
    return new Promise((resolve, reject) => {
      try {
        jwt.verify(token, SECRET_KEY, confJwt, function (err, decoded) {
          if (err) {
            resolve({ type: 'fail', message: err.message });
            return false;
          }
          const { cipherText } = decoded;
          let bytes = cryptojs.AES.decrypt(cipherText, KEY_ENC);
          let dataDecoded = JSON.parse(bytes.toString(cryptojs.enc.Utf8));
          resolve({ type: 'success', data: dataDecoded });
        })
      } catch (err) {
        reject(err);
      }
    })
  }

}

module.exports = LibJwt;
