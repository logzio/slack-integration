const Botkit = require('botkit');
const BotkitStorage = require('botkit-storage-mongo');
const LoggerFactory = require('./core/logging/logger-factory');
const CommandsRegistry = require('./core/commands/commands-registry');

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

function configureCommands(logzioBot) {
  CommandsRegistry.getCommands()
    .forEach(command => command.configure(logzioBot.controller));
}

class LogzioBot {

  constructor() {
    this.bots = {};
  }

  bootstrap(clientId, clientSecret, clientVerificationToken, mongoUri, port) {
    const config = {
      logger: LoggerFactory.getLogger('botkit'),
      disable_startup_messages: true,
      storage: BotkitStorage({
        mongoUri: mongoUri
      }),
    };

    this.controller = Botkit.slackbot(config).configureSlackApp({
      clientId: clientId,
      clientSecret: clientSecret,
      clientVerificationToken: clientVerificationToken,
      scopes: ['bot'],
    });

    this.controller.setupWebserver(port, (err, webserver) => {
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

    configureCommands(this);
    connectToExistingTeams(this);
  }

  registerCommand(command) {
    CommandsRegistry.register(command);
    return this;
  }

}

module.exports = LogzioBot;
