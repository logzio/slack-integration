const AlertsClient = require('./alerts/alerts-client');
const Botkit = require('botkit');
const CommandsRegistry = require('./core/commands/commands-registry');
const EndpointResolver = require('./core/client/endpoint-resolver');
const GetTriggeredAlertsCommand = require('./alerts/get-triggered-alerts-command');
const HelpCommand = require('./help/help-command');
const HttpClient = require('./core/client/http-client');
const KibanaClient = require('./kibana/kibana-client');
const KibanaObjectsCommand = require('./kibana/kibana-objects-command');
const LoggerFactory = require('./core/logging/logger-factory');
const PromiseStorage = require('botkit-promise-storage');
const SearchClient = require('./search/search-client');
const SearchCommand = require('./search/search-command');
const AddAccountCommand = require('./accounts/add/add-account-command');
const SetupDialogHandler = require('./accounts/add/add-account-dialog-handler');
const SetupDialogSender = require('./accounts/add/add-dialog-sender');
const ShowAlertCommand = require('./alerts/show-alert-command');
const SnapshotCommand = require('./snapshots/snapshot-command');
const SnapshotsClient = require('./snapshots/snapshots-client');
const TeamConfigurationService = require('./core/configuration/team-configuration-service');
const UnknownCommand = require('./help/unknown-command');

const ChannelAccountHandler = require('./accounts/channel/channel-account-handler');
const ClearActiveCommand = require('./accounts/channel/clear-channel-account-command');
const SetActiveCommand = require('./accounts/channel/set-channel-account-command');

const DefaultHandler = require('./accounts/default/default-handler');
const ClearDefaultCommand = require('./accounts/default/clear-default-command');
const SetDefaultCommand = require('./accounts/default/set-default-command');

const GetAccountsCommand = require('./accounts/get/get-accounts-command');
const RemoveAccountCommand = require('./accounts/remove/remove-command');


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
        logzioBot.removeAccountHandler.sendSetupMessage(bot, config.createdBy, true)
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
  const teamConfigurationService = new TeamConfigurationService(storage);
  const endpointResolver = new EndpointResolver(apiConfig);

  const httpClient = new HttpClient(teamConfigurationService, endpointResolver);
  const alertsClient = new AlertsClient(httpClient);
  const kibanaClient = new KibanaClient(httpClient);
  const channelAccountHandler = new ChannelAccountHandler(teamConfigurationService);
  const defaultHandler = new DefaultHandler(teamConfigurationService, httpClient);

  logzioBot.setupDialogSender = new SetupDialogSender(teamConfigurationService, apiConfig);

  CommandsRegistry.register(new GetTriggeredAlertsCommand(alertsClient));
  CommandsRegistry.register(new HelpCommand());
  CommandsRegistry.register(new KibanaObjectsCommand(kibanaClient));
  CommandsRegistry.register(new SearchCommand(new SearchClient(httpClient)));
  CommandsRegistry.register(new AddAccountCommand(logzioBot.setupDialogSender));
  CommandsRegistry.register(new ShowAlertCommand(alertsClient));
  CommandsRegistry.register(new SnapshotCommand(externalDomain, kibanaClient, new SnapshotsClient(httpClient)));
  CommandsRegistry.register(new ClearActiveCommand(channelAccountHandler));
  CommandsRegistry.register(new SetActiveCommand(channelAccountHandler));
  CommandsRegistry.register(new ClearDefaultCommand(defaultHandler));
  CommandsRegistry.register(new SetDefaultCommand(defaultHandler));
  CommandsRegistry.register(new GetAccountsCommand(teamConfigurationService));
  CommandsRegistry.register(new RemoveAccountCommand(teamConfigurationService));
  CommandsRegistry.register(new UnknownCommand());

  CommandsRegistry.getCommands()
    .forEach(command => command.configure(logzioBot.controller));

  const setupDialogHandler = new SetupDialogHandler(teamConfigurationService, httpClient, apiConfig);
  setupDialogHandler.configure(logzioBot.controller);
}

class LogzioBot {

  constructor(apiConfig, externalDomain, storage) {
    this.bots = {};
    this.apiConfig = apiConfig;
    this.externalDomain = externalDomain;
    this.storage = new PromiseStorage({ storage });
  }

  bootstrap(clientId, clientSecret, clientVerificationToken, port) {
    const config = {
      logger: LoggerFactory.getLogger('botkit'),
      disable_startup_messages: true,
      require_delivery: true,
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
      this.controller.createWebhookEndpoints(webserver);

      this.controller.createOauthEndpoints(webserver, (err, req, res) => {
        if (err) {
          res.status(500).send('ERROR: ' + err);
        } else {
          res.redirect('https://logz.io/alice-confirm/');
        }
      });

      webserver.get('/*', function(req, res) {
        res.redirect('https://logz.io');
      });
    });

    this.controller.on('create_bot', (bot, config) => createBot(this, bot, config));

    this.controller.on('rtm_close', (bot, err) => {
      delete this.bots[bot.config.token];
      logger.warn(`RTM connection for bot ${bot.config.token} closed - trying to reopen RTM connection`, err);
      createBot(this, bot, {});
    });

    registerAndConfigureCommands(this);
    connectToExistingTeams(this);
  }

}

process.on('uncaughtException', err => {
  logger.error('Caught exception: ' + err);
});

module.exports = LogzioBot;
