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
    if(typeof lastArg === 'object') {
      if (!('logger' in lastArg)) {
        lastArg['logger'] = loggerName;
      }
    } else {
      args[args.length] = { logger : loggerName };
    }

    winston.Logger.prototype.log.apply(this, args);
  };
}

function getTransporters() {
  const transporters = [
    new winston.transports.Console({ colorize: true })
  ];

  const logzioToken = process.env['LOGZIO_TOKEN'];
  if (logzioToken) {
    const options = {
      token: logzioToken,
      type: process.env['LOGZIO_LOG_TYPE'] || 'logzio-bot',
    };

    const logzioHost = process.env['LOGZIO_HOST'];
    if (logzioHost) options['host'] = logzioHost;


    const logzioTransport = new LogzioWinstonTransport(options);
    process.on('uncaughtException', function (err) {
      LoggerFactory.getLogger('root').error("UncaughtException processing: %s", err);
      logzioTransport.flush(() => process.exit(1));
    });

    transporters.push(logzioTransport)
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

    let logger = new winston.Logger({
      level: 'info',
      levels: winston.config.npm.levels,
      transports: transporters,
      exceptionHandlers: transporters,
      exitOnError: true,
    });

    logger.log = createLogFunctionWithLoggerName(loggerName);

    loggers[loggerName] = logger;

    return logger;
  }

}

module.exports = LoggerFactory;
