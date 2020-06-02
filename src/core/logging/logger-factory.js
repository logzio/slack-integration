const path = require('path');
const winston = require('winston');
const LogzioWinstonTransport = require('winston-logzio');

const rootPath = path.resolve(__dirname, '../../');
const loggers = {};
const transporters = getTransporters();

function getTransporters() {
  const transporters = [];
  const logzioToken = process.env['LOGZIO_TOKEN'];
  if (logzioToken) {
    const options = {
      level: 'info',
      name: 'winston_logzio',
      token: logzioToken,
      type: process.env['LOGZIO_LOG_TYPE'] || 'logzio-bot',
      exitOnError: true,
      transports: []
    };

    const logzioHost = process.env['LOGZIO_HOST'];
    if (logzioHost) options['host'] = logzioHost;
    const logzioTransport = new LogzioWinstonTransport(options);
    process.on('uncaughtException', err => {
      LoggerFactory.getLogger('root').error(
        'UncaughtException processing: %s',
        err
      );
    });
    transporters.push(logzioTransport);
  }
  return transporters;
}


class LoggerFactory {
  static getLogger(loggerName) {
    if (loggerName.startsWith(rootPath)) {
      loggerName = path.relative(rootPath, loggerName);
    }

    if (loggerName in loggers) {
      return loggers[loggerName];
    }

    const logger = winston.createLogger({
      transports: transporters
    });

    logger.add(new winston.transports.File({ filename: 'alice-bot.log' }));
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
    loggers[loggerName] = logger;
    return logger;
  }
}

module.exports = LoggerFactory;
