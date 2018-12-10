const LoggerFactory = require('../../core/logging/logger-factory');
const TeamConfiguration = require('../../core/configuration/team-configuration');
const { getEventMetadata } = require('../../core/logging/logging-metadata');
const { sendUsage } = require('../../help/usage-message-supplier');

const logger = LoggerFactory.getLogger(__filename);

function validateConfigurationAndGetErrorsIfInvalid(configuredRegions, accountRegion, apiToken, alias) {
  const errors = [];

  if (!configuredRegions.hasOwnProperty(accountRegion)) {
    errors.push({
      name: 'accountRegion',
      error: 'Account region must be US or EU.'
    });
  }

  if (!apiToken || apiToken.trim() === '') {
    errors.push({
      name: 'apiToken',
      error: 'API token can\'t be blank'
    });
  }

  if (!alias || alias.trim() === ''){
    errors.push({
      name: 'alias',
      error: 'Alias can\'t be blank'
    });
  }

  return errors.length > 0 ? errors : null;
}

function sendInvalidConfigurationError(bot) {
  bot.dialogError([{
    name: 'Configuration error',
    error: 'I couldn\'t connect to your account. Please double-check your API token and region, and try again. If that doesn\'t fix the problem, email [Support](mailto:help@logz.io).'
  }]);
}

class AddAccountDialogHandler {

  constructor(teamConfigService, httpClient, apiConfig) {
    this.teamConfigService = teamConfigService;
    this.httpClient = httpClient;
    this.configuredRegions = apiConfig['regions'];
  }

  configure(controller) {
    controller.on('dialog_submission', async (bot, message) => {
      if (message.callback_id !== 'setup_dialog' && message.callback_id !== 'initialization_setup_dialog') return;

      const submission = message['submission'];

      const accountRegion = submission['accountRegion'];
      const apiToken = submission['apiToken'];
      const alias = submission['alias'];

      const configErrors = validateConfigurationAndGetErrorsIfInvalid(this.configuredRegions, accountRegion, apiToken, alias);
      if (configErrors) {
        bot.dialogError(configErrors);
      }

      this.httpClient.getRealName(apiToken, accountRegion)
        .then(realName => {

          let onRejected = err => {
            bot.reply(message, 'Yikes! I\'m not sure what happened, but I couldn\'t save your configuration. Please try again, and contact [Support](mailto:help@logz.io) if this keeps happening.');
            logger.error(`Failed to save configuration for team ${message.teamId} (${message.domain})`, err,
              getEventMetadata(message.raw_message, 'configuration_change_failed'));
          };
          realName = realName.accountName;
          const config = new TeamConfiguration()
            .setLogzioAccountRegion(accountRegion)
            .setLogzioApiToken(apiToken)
            .setAlias(alias)
            .setRealName(realName);

          const rawMessage = message.raw_message;
          const team = rawMessage.team;
          const user = rawMessage.user;


          return this.teamConfigService.addAccount(team.id, config)
            .then(() => {
              bot.reply(message, `Configuration saved! added ${realName} with account alias ${alias}`, err => {
                if (!err && message.callback_id === 'initialization_setup_dialog') {
                  bot.reply(message, `Seems like this is the first configured account, to set it as default account just type <@${bot.identity.id}> set workspace account ${alias}`);
                  bot.reply(message, `If you want to learn what I can do, just type <@${bot.identity.id}> help.`, () => sendUsage(bot, message, ''));
                }
              });
              logger.info(`Configuration for team ${team.id} (${team.domain}) changed by user ${user.id} (${user.name})`,
                getEventMetadata(rawMessage, 'configuration_changed'));

              bot.dialogOk();
            })
            .catch(onRejected);
        })
        .catch(err => {
          logger.error(err);
          return sendInvalidConfigurationError(bot)
        });
    });
  }

  getRealName(token, region) {
    this.httpClient.getRealName(token, region)
  }
}

module.exports = AddAccountDialogHandler;
