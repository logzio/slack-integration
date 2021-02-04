const BasicUp = require('./core/utils/basicUp');

const dbConfig = {
  user: BasicUp.getRequiredValueFromEnv('MYSQL_USER'),
  password: BasicUp.getRequiredValueFromEnv('MYSQL_PASSWORD'),
  database: BasicUp.getRequiredValueFromEnv('MYSQL_DATABASE'),
  host: BasicUp.getRequiredValueFromEnv('MYSQL_HOST'),
};

module.exports = { dbConfig };
