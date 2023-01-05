const path = require('path');
const winston = require('winston');

class LibWinston {

  static initialize(filename) {
    winston.addColors(this.getColours());
    return winston.createLogger({
      level: this.getAccessLevel(),
      levels: this.getLevels(),
      exitOnError: false,
      format: winston.format.combine(
        // winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.File({ filename: path.join(__dirname, '../logs', `${filename}.log`), level: this.getAccessLevel(), maxsize: '10000000', maxFiles: '10' }),
      ],
    });
  }

  static getLevels() {
    return {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4,
    };
  }

  static getColours() {
    return {
      error: 'red',
      warn: 'yellow',
      info: 'green',
      http: 'magenta',
      debug: 'white',
    };
  }

  static getAccessLevel() {
    if (process.env.NODE_ENV == 'production') {
      return 'info';
    }
    // development
    return 'debug';
  }

}

module.exports = LibWinston;