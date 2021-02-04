const LogzioBot = require('./logzio-bot');
const BasicUp = require('./core/utils/basicUp');
const { dbConfig } = require('./db-config');

BasicUp.migrateDatabase(dbConfig).then(() => {
  const apiConfig = require('../conf/api');
  const externalDomain = BasicUp.getRequiredValueFromEnv('EXTERNAL_DOMAIN');

  const logzioBot = new LogzioBot(apiConfig, externalDomain);
  logzioBot.bootstrap(
    BasicUp.getRequiredValueFromEnv('CLIENT_ID'),
    BasicUp.getRequiredValueFromEnv('CLIENT_SECRET'),
    BasicUp.getRequiredValueFromEnv('VERIFICATION_TOKEN'),
    BasicUp.getRequiredValueFromEnv('PORT')
  );
});
