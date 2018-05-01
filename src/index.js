const LogzioBot = require('./logzio-bot');

function getRequiredValueFromEnv(variableName) {
  const value = process.env[variableName];
  if (!value) {
    throw new Error(`Missing required environment variable '${variableName}'`);
  }

  return value;
}

const apiConfig = require('../conf/api');
const logzioBot = new LogzioBot(apiConfig);
logzioBot.bootstrap(
  getRequiredValueFromEnv('CLIENT_ID'),
  getRequiredValueFromEnv('CLIENT_SECRET'),
  getRequiredValueFromEnv('VERIFICATION_TOKEN'),
  getRequiredValueFromEnv('EXTERNAL_DOMAIN'),
  getRequiredValueFromEnv('MONGODB_URI'),
  getRequiredValueFromEnv('PORT'),
);
