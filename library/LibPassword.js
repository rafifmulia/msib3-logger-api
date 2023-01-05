const bcrypt = require('bcrypt');

const saltRounds = 10;

class LibPassword {

  static async hashPw(plainTextPassword) {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) {
          reject(err);
          return false;
        }
        bcrypt.hash(plainTextPassword, salt, function (err, hash) {
          if (err) {
            reject(err);
            return false;
          }
          resolve(hash);
        })
      })
    })
  }

  static async checkPw(hash, plainText) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(plainText, hash, function (err, result) {
        if (err) {
          reject(err);
          return false;
        }
        resolve(result);
      })
    })
  }

}

module.exports = LibPassword;