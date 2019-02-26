const LogzStorageMySQL = require('./core/storage/logzio-storage');
const LogzioBot = require('./logzio-bot');
const DBUtils = require('./core/utils/basicUp');

const dbConfig = {
  user: DBUtils.getRequiredValueFromEnv('MYSQL_USER'),
  password: DBUtils.getRequiredValueFromEnv('MYSQL_PASSWORD'),
  database: DBUtils.getRequiredValueFromEnv('MYSQL_DATABASE'),
  host: DBUtils.getRequiredValueFromEnv('MYSQL_HOST')
};

DBUtils.migrateDatabase(dbConfig).then(() => {
  const apiConfig = require('../conf/api');
  const externalDomain = DBUtils.getRequiredValueFromEnv('EXTERNAL_DOMAIN');
  const storage = new LogzStorageMySQL(dbConfig);

  const logzioBot = new LogzioBot(apiConfig, externalDomain, storage);
  logzioBot.bootstrap(
    DBUtils.getRequiredValueFromEnv('CLIENT_ID'),
    DBUtils.getRequiredValueFromEnv('CLIENT_SECRET'),
    DBUtils.getRequiredValueFromEnv('VERIFICATION_TOKEN'),
    DBUtils.getRequiredValueFromEnv('PORT')
  );
});
