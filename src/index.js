const LogzioBot = require('./logzio-bot');
const HelpCommand = require('./help/help-command');

function getRequiredValueFromEnv(variableName) {
  const value = process.env[variableName];
  if (!value) {
    throw new Error(`Missing required environment variable '${variableName}'`);
  }

  return value;
}

let logzioBot = new LogzioBot();
logzioBot.registerCommand(new HelpCommand());
logzioBot.bootstrap(
  getRequiredValueFromEnv('CLIENT_ID'),
  getRequiredValueFromEnv('CLIENT_SECRET'),
  getRequiredValueFromEnv('VERIFICATION_TOKEN'),
  getRequiredValueFromEnv('MONGODB_URI'),
  getRequiredValueFromEnv('PORT')
);
