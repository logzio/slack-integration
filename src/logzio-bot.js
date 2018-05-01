const AlertsClient = require('./alerts/alerts-client');
const Botkit = require('botkit');
const BotkitStorage = require('botkit-storage-mongo');
const CommandsRegistry = require('./core/commands/commands-registry');
const EndpointResolver = require('./core/client/endpoint-resolver');
const GetTriggeredAlertsCommand = require('./alerts/get-triggered-alerts-command');
const HelpCommand = require('./help/help-command');
const HttpClient = require('./core/client/http-client');
const KibanaClient = require('./kibana/kibana-client');
const KibanaObjectsCommand = require('./kibana/kibana-objects-command');
const LoggerFactory = require('./core/logging/logger-factory');
const SearchClient = require('./search/search-client');
const SearchCommand = require('./search/search-command');
const SetupCommand = require('./setup/setup-command');
const ShowAlertCommand = require('./alerts/show-alert-command');
const SnapshotCommand = require('./snapshots/snapshot-command');
const SnapshotsClient = require('./snapshots/snapshots-client');
const TeamConfigurationService = require('./core/configuration/team-configuration-service');
const UnknownCommand = require('./help/unknown-command');

const { createWebhookProxyEndpoint } = require('./core/webhook/webhook-proxy');

const logger = LoggerFactory.getLogger(__filename);

function createBot(logzioBot, bot, config) {
  if (logzioBot.bots[bot.config.token]) {
    // already online! do nothing.
  } else {
    bot.startRTM(err => {
      if (err) {
        throw new Error(err);
      }

      trackBot(logzioBot, bot);

      if (config.createdBy) {
        bot.startPrivateConversation({ user: config.createdBy }, (err, convo) => {
          if (err) {
            logger.error(err);
          } else {
            convo.say('I am a bot that has just joined your team');
            convo.say('You must now /invite me to a channel so that I can be of use!');
          }
        });
      }
    });
  }
}

function trackBot(logzioBot, bot) {
  logzioBot.bots[bot.config.token] = bot;
}

function connectToExistingTeams(logzioBot) {
  logzioBot.controller.storage.teams.all((err, teams) => {
    if (err) {
      throw err;
    }

    // connect all teams with bots up to slack!
    for (const team  in teams) {
      if (teams[team].bot) {
        const bot = logzioBot.controller.spawn(teams[team]).startRTM((err) => {
          if (err) {
            logger.error('Error connecting bot to Slack:', err);
          } else {
            trackBot(logzioBot, bot);
          }
        });
      }
    }
  });

}

function registerAndConfigureCommands(logzioBot) {
  const apiConfig = logzioBot.apiConfig;
  const externalDomain = logzioBot.externalDomain;

  const storage = logzioBot.storage;
  const teamConfigurationService = new TeamConfigurationService(storage.teams);
  const endpointResolver = new EndpointResolver(apiConfig);

  const httpClient = new HttpClient(teamConfigurationService, endpointResolver);
  const alertsClient = new AlertsClient(httpClient);
  const kibanaClient = new KibanaClient(httpClient);
  CommandsRegistry.register(new GetTriggeredAlertsCommand(alertsClient));
  CommandsRegistry.register(new HelpCommand());
  CommandsRegistry.register(new KibanaObjectsCommand(kibanaClient));
  CommandsRegistry.register(new SearchCommand(new SearchClient(httpClient)));
  CommandsRegistry.register(new SetupCommand(apiConfig, teamConfigurationService));
  CommandsRegistry.register(new ShowAlertCommand(alertsClient));
  CommandsRegistry.register(new SnapshotCommand(externalDomain, kibanaClient, new SnapshotsClient(httpClient)));
  CommandsRegistry.register(new UnknownCommand());
  CommandsRegistry.getCommands()
    .forEach(command => command.configure(logzioBot.controller));
}

class LogzioBot {

  constructor(apiConfig) {
    this.bots = {};
    this.apiConfig = apiConfig;
  }

  bootstrap(clientId, clientSecret, clientVerificationToken, externalDomain, mongoUri, port) {
    this.storage = BotkitStorage({ mongoUri });

    const config = {
      logger: LoggerFactory.getLogger('botkit'),
      disable_startup_messages: true,
      storage: this.storage,
    };

    this.controller = Botkit.slackbot(config).configureSlackApp({
      clientId: clientId,
      clientSecret: clientSecret,
      clientVerificationToken: clientVerificationToken,
      scopes: ['bot'],
    });

    this.controller.setupWebserver(port, (err, webserver) => {
      createWebhookProxyEndpoint(this, webserver);
      this.controller.createHomepageEndpoint(webserver);
      this.controller.createWebhookEndpoints(webserver);

      this.controller.createOauthEndpoints(webserver, (err, req, res) => {
        if (err) {
          res.status(500).send('ERROR: ' + err);
        } else {
          res.send('Success!');
        }
      });
    });

    this.controller.on('create_bot', (bot, config) => createBot(this, bot, config));

    registerAndConfigureCommands(this);
    connectToExistingTeams(this);
  }

}

module.exports = LogzioBot;
