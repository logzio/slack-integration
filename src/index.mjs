import LogzioBot from './logzio-bot'

function getRequiredValueFromEnv(variableName) {
  const value = process.env[variableName];
  if (!value) {
    throw new Error(`Missing required environment variable '${variableName}'`);
  }

  return value;
}

let logzioBot = new LogzioBot();
logzioBot.bootstrap(
  getRequiredValueFromEnv('CLIENT_ID'),
  getRequiredValueFromEnv('CLIENT_SECRET'),
  getRequiredValueFromEnv('VERIFICATION_TOKEN'),
  getRequiredValueFromEnv('MONGODB_URI'),
  getRequiredValueFromEnv('PORT')
);
