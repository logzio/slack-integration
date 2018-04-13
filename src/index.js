const BotkitStorage = require('botkit-storage-mongo');
const EndpointResolver = require('./core/client/endpoint-resolver');
const HelpCommand = require('./help/help-command');
const HttpClient = require('./core/client/http-client');
const KibanaClient = require('./kibana/kibana-client');
const KibanaObjectsCommand = require('./kibana/kibana-objects-command');
const LogzioBot = require('./logzio-bot');
const SearchClient = require('./search/search-client');
const SearchCommand = require('./search/search-command');
const SetupCommand = require('./setup/setup-command');
const TeamConfigurationService = require('./core/configuration/team-configuration-service');

const apiConfig = require('../conf/api');

function getRequiredValueFromEnv(variableName) {
  const value = process.env[variableName];
  if (!value) {
    throw new Error(`Missing required environment variable '${variableName}'`);
  }

  return value;
}

const storage = BotkitStorage({
  mongoUri: getRequiredValueFromEnv('MONGODB_URI')
});

const teamConfigurationService = new TeamConfigurationService(storage.teams);
const endpointResolver = new EndpointResolver(apiConfig);
const httpClient = new HttpClient(teamConfigurationService, endpointResolver);

const logzioBot = new LogzioBot(storage);
logzioBot.registerCommand(new HelpCommand());
logzioBot.registerCommand(new KibanaObjectsCommand(new KibanaClient(httpClient)));
logzioBot.registerCommand(new SearchCommand(new SearchClient(httpClient)));
logzioBot.registerCommand(new SetupCommand(apiConfig, teamConfigurationService));
logzioBot.bootstrap(
  getRequiredValueFromEnv('CLIENT_ID'),
  getRequiredValueFromEnv('CLIENT_SECRET'),
  getRequiredValueFromEnv('VERIFICATION_TOKEN'),
  getRequiredValueFromEnv('PORT')
);
