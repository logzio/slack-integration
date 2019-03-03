const LogzStorageMySQL = require('./core/storage/logzio-storage');
const LogzioBot = require('./logzio-bot');
const BasicUp = require('./core/utils/basicUp');

const dbConfig = {
  user: BasicUp.getRequiredValueFromEnv('MYSQL_USER'),
  password: BasicUp.getRequiredValueFromEnv('MYSQL_PASSWORD'),
  database: BasicUp.getRequiredValueFromEnv('MYSQL_DATABASE'),
  host: BasicUp.getRequiredValueFromEnv('MYSQL_HOST')
};

BasicUp.migrateDatabase(dbConfig).then(() => {
  const apiConfig = require('../conf/api');
  const externalDomain = BasicUp.getRequiredValueFromEnv('EXTERNAL_DOMAIN');
  const storage = new LogzStorageMySQL(dbConfig);

  const logzioBot = new LogzioBot(apiConfig, externalDomain, storage);
  logzioBot.bootstrap(
    BasicUp.getRequiredValueFromEnv('CLIENT_ID'),
    BasicUp.getRequiredValueFromEnv('CLIENT_SECRET'),
    BasicUp.getRequiredValueFromEnv('VERIFICATION_TOKEN'),
    BasicUp.getRequiredValueFromEnv('PORT')
  );
});
