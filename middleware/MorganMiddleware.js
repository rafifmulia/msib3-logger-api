const morgan = require('morgan');
const LibWinston = require('../library/LibWinston');

const customFormat = "{remoteAddr:':remote-addr', remoteUser:':remote-user', date:':date[iso]', method:':method', url:':url', http:'HTTP/:http-version', statusCode:':status', contentLength:':res[content-length]', referrer:':referrer', userAgent:':user-agent'}";

class MorganMiddleware {
  static initialize() {
    return morgan(customFormat, {
      stream: {
        write: (msg) => LibWinston.http(msg),
      },
      // skip: (req, res) => res.statusCode < 400,
    });
  }
}

module.exports = MorganMiddleware.initialize();