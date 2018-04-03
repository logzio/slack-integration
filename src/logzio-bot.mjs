import Botkit from 'botkit';
import BotkitStorage from 'botkit-storage-mongo';
import LoggerFactory from './logging/logger-factory';
import CommandsRegistry from "./core/commands/CommandsRegistry";

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

    this.controller.on('create_bot', this.createBot);

    this.configureCommands();
    this.connectToExistingTeams();
  }

  registerCommand(command) {
    CommandsRegistry.register(command);
  }

  getController() {
    return this.controller;
  }

  configureCommands() {
    CommandsRegistry.getCommands()
      .forEach(command => command.configure(this.controller));
  }

  createBot(bot, config) {
    if (this.bots[bot.config.token]) {
      // already online! do nothing.
    } else {

      bot.startRTM(err => {
        if (err) {
          throw new Error(err);
        }

        this.trackBot(bot);

        if (config.createdBy) {
          bot.startPrivateConversation({ user: config.createdBy }, (err, convo) => {
            if (err) {
              console.log(err);
            } else {
              convo.say('I am a bot that has just joined your team');
              convo.say('You must now /invite me to a channel so that I can be of use!');
            }
          });
        }
      });
    }
  }

  trackBot(bot) {
    this.bots[bot.config.token] = bot;
  }

  connectToExistingTeams() {
    this.controller.storage.teams.all((err, teams) => {
      if (err) {
        throw err;
      }

      // connect all teams with bots up to slack!
      for (const team  in teams) {
        if (teams[team].bot) {
          const bot = this.controller.spawn(teams[team]).startRTM((err) => {
            if (err) {
              console.log('Error connecting bot to Slack:', err);
            } else {
              this.trackBot(bot);
            }
          });
        }
      }
    });

  }

}

export default LogzioBot;
