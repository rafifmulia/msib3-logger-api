const path = require('path');
const ejs = require('ejs');
const nodemailer = require('nodemailer');
const LibWinston = require('./LibWinston');

const logName = 'libMail';
const Logger = LibWinston.initialize(logName);

class LibMail {

  static createTransport() {
    return new Promise((resolve, reject) => {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASW,
          },
          pool: true,
          // connectionTimeout: 10000,
          // greetingTimeout: 5000,
          // socketTimeout: 5000,
          // maxConnections: 10,
          // maxMessages: 500,
          // secure: false,
          // tls: {
          //     rejectUnauthorized: false
          // }
        });

        transporter.verify(function (err, success) {
          if (err) {
            transporter.close();
            // reject(err);
            resolve({
              type: 'error',
              e: err,
            });
            return false;
          }
          return resolve({
            type: 'success',
            transporter,
          });
        });
      } catch (e) {
        // reject(e);
        resolve({
          type: 'error',
          e,
        });
      }
    });
  }

  static async initializeTransport() {
    return new Promise(async (resolve, reject) => {
      try {
        let conn = await LibMail.createTransport();
        if (conn.type != 'success') {
          conn = await LibMail.createTransport();
        } else {
          if (!conn.transporter.isIdle()) {
            conn = await LibMail.createTransport();
          }
        }
        if (conn.type != 'success') {
          conn = await LibMail.createTransport();
        } else {
          if (!conn.transporter.isIdle()) {
            conn = await LibMail.createTransport();
          }
        }
        if (conn.type != 'success') {
          resolve({
            type: conn.type,
            e: conn.e,
          });
          return false;
        } else {
          if (!conn.transporter.isIdle()) {
            resolve({
              type: 'fail',
              msg: 'transporter not idle',
            });
            return false;
          }
        }

        resolve({
          type: 'success',
          transporter: conn.transporter,
        });
      } catch (e) {
        // reject(e);
        resolve({
          type: 'error',
          e,
        });
      }
    })
  }

  static async sendInfoLog(subject, to, mailData) {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          name,
          label,
          level,
          logtype,
          keys,
          ver,
          source,
          log_id,
          errors,
        } = mailData;

        const initTransport = await LibMail.initializeTransport();
        if (initTransport.type != 'success') {
          Logger.log('error', `${logName} transporter_error infoLog: ${JSON.stringify(initTransport)}`);
          resolve({
            type: initTransport.type,
            msg: initTransport.msg,
            e: initTransport.e,
          });
          return false;
        }
        const transporter = initTransport.transporter;

        const renderData = {
          name,
          label,
          level,
          logtype,
          keys,
          ver,
          source,
          log_id,
          errors,
          cs_phone: process.env.CS_PHONE,
          cs_mail: process.env.CS_MAIL,
          cs_addr: process.env.CS_ADDR,
          asset: process.env.MAIL_ASSET,
        }
        ejs.renderFile(path.join(__dirname, '../files/mails/infoLog.html'), renderData, function (err, html) {
          if (err) {
            Logger.log('error', `${logName} rendering_fail infoLog: ${JSON.stringify(err)}`);
            // reject(err);
            console.error(err);
            resolve({
              type: 'error',
              e: err,
            });
            return false;
          }
          const options = {
            from: process.env.SMTP_FROM,
            to,
            subject,
            html,
          };
          transporter.sendMail(options, function (err, info) {
            if (err) {
              Logger.log('error', `${logName} sending_fail infoLog: ${JSON.stringify(err)}`);
              // reject(err);
              console.error(err);
              resolve({
                type: 'error',
                e: err,
              });
              return false;
            }
            resolve({
              type: 'success',
              info,
            });
          });
        });
      } catch (e) {
        Logger.log('error', `${logName} sending_error infoLog: ${JSON.stringify(e)}`);
        // reject(e);
        console.error(e);
        resolve({
          type: 'error',
          e,
        });
      }
    });
  }

}

module.exports = LibMail;
