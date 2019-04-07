const LogzioWinstonTransport = require('winston-logzio');
const path = require('path');
const winston = require('winston');

const rootPath = path.resolve(__dirname, '../../');
const loggers = {};

const transporters = getTransporters();

function createLogFunctionWithLoggerName(loggerName) {
  return function() {
    const args = [...arguments];

    let lastArg = args[args.length - 1];
    if (typeof lastArg === 'object') {
      if (!('logger' in lastArg)) {
        lastArg['logger'] = loggerName;
      }
    } else {
      args[args.length] = { logger: loggerName };
    }

    winston.Logger.prototype.log.apply(this, args);
  };
}

class LoggerFactory {
  static getLogger(loggerName) {
    if (loggerName.startsWith(rootPath)) {
      loggerName = path.relative(rootPath, loggerName);
    }

    if (loggerName in loggers) {
      return loggers[loggerName];
    }

    let logger = new winston.Logger({
      level: 'info',
      levels: winston.config.npm.levels,
      transports: transporters,
      exceptionHandlers: transporters,
      exitOnError: true
    });

    const logger = winston.createLogger({
      transports: [logzioWinstonTransport]
    });

    if (process.env['NODE_ENV'] === 'dev') {
      logger.add(new winston.transports.Console({
        format: winston.format.simple()
      }));
    }
    loggers[loggerName] = logger;
    return logger;
  }
}

module.exports = LoggerFactory;
