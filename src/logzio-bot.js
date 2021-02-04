const { Botkit } = require('botkit');
const {
  SlackAdapter,
  SlackMessageTypeMiddleware,
  SlackEventMiddleware
} = require('botbuilder-adapter-slack');
const CommandsRegistry = require('./core/commands/commands-registry');
const { kibanaObjectsCommand } = require('./kibana');
const LoggerFactory = require('./core/logging/logger-factory');
const { searchCommand } = require('./search');
const {
  addAccountCommand,
  setupCommand,
  addAccountDialogHandler,
  addAccountDialogSender
} = require('./accounts/add');
const { showAlertsCommand } = require('./alerts');
const { snapshotCommand } = require('./snapshots');
const {
  clearChannelAccountCommand,
  getChannelAccountCommand,
  setChannelAccountCommand
} = require('./accounts/channel');
const { setDefaultCommand } = require('./accounts/default');
const { getAccountsCommand } = require('./accounts/get');

const { createWebhookProxyEndpoint } = require('./core/webhook/webhook-proxy');
const { triggeredAlertsCommand } = require('./alerts');
const { helpCommand, unknownCommand } = require('./help');
const { storageService } = require('./core/storage');
const addSetAccountChannelDialog = require('./dialogs/set-channel-account');
const addSetDefaultAccountDialog = require('./dialogs/set-default-account');

const logger = LoggerFactory.getLogger(__filename);

function trackBot(logzioBot, bot) {
  logzioBot.bots[bot.config.token] = bot;
}

function connectToExistingTeams(logzioBot, teamsStorage) {
  teamsStorage.all(async (err, teams) => {
    if (err) {
      throw err;
    }
    // connect all teams with bots up to slack!
    for (const team in teams) {
      if (teams[team].bot) {
        try {
          const bot = await logzioBot.controller.spawn(teams[team]);
          trackBot(logzioBot, bot);
        } catch (err) {
          logger.error('Error connecting bot to Slack:', err);
        }
      }
    }
  });
}

function registerAndConfigureCommands(controller) {
  CommandsRegistry.register(triggeredAlertsCommand);
  CommandsRegistry.register(helpCommand);
  CommandsRegistry.register(kibanaObjectsCommand);
  CommandsRegistry.register(searchCommand);
  CommandsRegistry.register(addAccountCommand);
  CommandsRegistry.register(showAlertsCommand);
  CommandsRegistry.register(snapshotCommand);
  CommandsRegistry.register(clearChannelAccountCommand);
  CommandsRegistry.register(setChannelAccountCommand);
  CommandsRegistry.register(getChannelAccountCommand);
  CommandsRegistry.register(setDefaultCommand);
  CommandsRegistry.register(getAccountsCommand);
  // CommandsRegistry.register(new RemoveAccountCommand(removeAccountHandler));
  CommandsRegistry.register(setupCommand);
  CommandsRegistry.register(unknownCommand);
  addAccountDialogHandler.configure(controller);
}

class LogzioBot {
  constructor() {
    this.bots = {};
    this.tokenCache = {};
    this.userCache = {};
  }

  bootstrap(clientId, clientSecret, clientVerificationToken, port) {
    require('dotenv').config();

    if (process.env.TOKENS) {
      this.tokenCache = JSON.parse(process.env.TOKENS);
    }

    if (process.env.USERS) {
      this.userCache = JSON.parse(process.env.USERS);
    }

    const adapter = new SlackAdapter({
      // parameters used to secure webhook endpoint
      verificationToken: clientVerificationToken,
      clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,

      // auth token for a single-team app
      botToken: process.env.BOT_TOKEN,

      // credentials used to set up oauth for multi-team apps
      clientId,
      clientSecret,
      scopes: ['bot'],
      redirectUri: process.env.REDIRECT_URI,

      // functions required for retrieving team-specific info
      // for use in multi-team apps
      getTokenForTeam: getTokenForTeam,
      getBotUserByTeam: getBotUserByTeam
    });

    // Use SlackEventMiddleware to emit events that match their original Slack event types.
    adapter.use(new SlackEventMiddleware());

    // Use SlackMessageType middleware to further classify messages as direct_message, direct_mention, or mention
    adapter.use(new SlackMessageTypeMiddleware());

    const controller = new Botkit({
      webhook_uri: '/api/messages',

      adapter: adapter,

      storage: storageService
    });

    // Once the bot has booted up its internal services, you can use them to do stuff.
    controller.ready(() => {
      this.controller = controller;
      // load traditional developer-created local custom feature modules
      controller.loadModules(__dirname + '/features');

      /* catch-all that uses the CMS to trigger dialogs */
      if (controller.plugins.cms) {
        controller.on('message,direct_message', async (bot, message) => {
          let results = false;
          results = await controller.plugins.cms.testTrigger(bot, message);

          if (results !== false) {
            // do not continue middleware!
            return false;
          }
        });
      }

      // This code existed in the old version, and may no longer be needed
      // // this.controller.setupWebserver(port, (err, webserver) => {
      //   createWebhookProxyEndpoint(this, webserver);
      //   this.controller.createWebhookEndpoints(webserver);
      //
      //   this.controller.createOauthEndpoints(webserver, (err, req, res) => {
      //     if (err) {
      //       res.status(500).send('ERROR: ' + err);
      //     } else {
      //       res.redirect('https://logz.io/alice-confirm/');
      //     }
      //   });
      //
      //   webserver.get('/*', function(req, res) {
      //     res.redirect('https://logz.io');
      //   });
      // });

      registerAndConfigureCommands(controller);
      registerDialogs(controller);
      connectToExistingTeams(this, storageService.teams);
    });

    controller.webserver.get('/', (req, res) => {
      res.send(`This app is running Botkit ${controller.version}.`);
    });

    controller.webserver.get('/install', (req, res) => {
      // getInstallLink points to slack's oauth endpoint and includes clientId and scopes
      res.redirect(controller.adapter.getInstallLink());
    });

    controller.webserver.get('/install/auth', async (req, res) => {
      try {
        const results = await controller.adapter.validateOauthCode(
          req.query.code
        );

        console.log('FULL OAUTH DETAILS', results);

        // Store token by team in bot state.
        this.tokenCache[results.team_id] = results.bot.bot_access_token;

        // Capture team to bot id
        this.userCache[results.team_id] = results.bot.bot_user_id;

        res.json('Success! Bot installed.');
      } catch (err) {
        console.error('OAUTH ERROR:', err);
        res.status(401);
        res.send(err.message);
      }
    });

    controller.on('message', async (bot, message) => {
      await bot.reply(message, 'I heard a message!');
    });

    controller.on(
      'create_bot',
      async (bot, config) => await createBot(this, bot, config)
    );

    controller.on('rtm_close', async (bot, err) => {
      if (this.bots[bot.config.token].rtm._closeCode !== 1006) {
        reconnectBot.call(this, bot, err);
      }
    });

    controller.on('rtm_reconnect_failed', async (bot, err) => {
      reconnectBot.call(this, bot, err);
    });

    async function getTokenForTeam(teamId) {
      if (this.tokenCache[teamId]) {
        return new Promise(resolve => {
          setTimeout(function() {
            resolve(this.tokenCache[teamId]);
          }, 150);
        });
      } else {
        console.error('Team not found in tokenCache: ', teamId);
      }
    }

    async function getBotUserByTeam(teamId) {
      if (this.userCache[teamId]) {
        return new Promise(resolve => {
          setTimeout(function() {
            resolve(this.userCache[teamId]);
          }, 150);
        });
      } else {
        console.error('Team not found in userCache: ', teamId);
      }
    }
  }
}

function registerDialogs(controller) {
  addSetAccountChannelDialog(controller);
  addSetDefaultAccountDialog(controller);
}

function createBot(logzioBot, bot, config) {
  if (logzioBot.bots[bot.config.token]) {
    // already online! do nothing.
  } else {
    bot.startRTM(err => {
      if (err) {
        logger.error('startRTM error ' + err);
        throw new Error(err);
      }

      trackBot(logzioBot, bot);
      if (config.createdBy) {
        addAccountDialogSender.sendSetupMessage(bot, config.createdBy, true);
      }
    });
  }
}

function reconnectBot(bot, err) {
  delete this.bots[bot.config.token];
  logger.warn(
    `RTM connection for bot ${bot.config.token} closed - trying to reopen RTM connection`,
    err
  );
  createBot(this, bot, {});
}

process.on('uncaughtException', err => {
  logger.error('Caught exception: ' + err);
});

module.exports = LogzioBot;
