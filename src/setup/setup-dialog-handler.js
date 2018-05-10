const HttpMethod = require('../core/client/http-method');
const LoggerFactory = require('../core/logging/logger-factory');
const TeamConfiguration = require('../core/configuration/team-configuration');
const { getEventMetadata } = require('../core/logging/logging-metadata');
const { sendUsage } = require('../help/usage-message-supplier');

const logger = LoggerFactory.getLogger(__filename);

function validateConfigurationAndGetErrorsIfInvalid(configuredRegions, accountRegion, apiToken) {
  const errors = [];

  if (!configuredRegions.hasOwnProperty(accountRegion)) {
    errors.push({
      name: 'accountRegion',
      error: 'Invalid account region.'
    });
  }

  if (!apiToken || apiToken.trim() === '') {
    errors.push({
      name: 'apiToken',
      error: 'Api token cannot be blank.'
    });
  }

  return errors.length > 0 ? errors : null;
}

function sendInvalidConfigurationError(bot) {
  bot.dialogError([{
    name: 'accountRegion',
    error: 'Please make sure you selected the right account region and that your API token is valid.' +
    'If the error proceed please contact support.'
  }]);
}

class SetupDialogHandler {

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

      const configErrors = validateConfigurationAndGetErrorsIfInvalid(this.configuredRegions, accountRegion, apiToken);
      if (configErrors) {
        bot.dialogError(configErrors);
      }

      this.httpClient.sendRequestWithRegionAndToken(accountRegion, apiToken, HttpMethod.GET, '/v1/user-management')
        .then(users => {
          if (!users || !(users instanceof Array) || users.length === 0) {
            sendInvalidConfigurationError(bot);
            return;
          }

          const config = new TeamConfiguration()
            .setLogzioAccountRegion(accountRegion)
            .setLogzioApiToken(apiToken);

          const rawMessage = message.raw_message;
          const team = rawMessage.team;
          const user = rawMessage.user;

          return this.teamConfigService.save(team.id, config)
            .then(() => {
              bot.reply(message, 'Configuration saved!', err => {
                if (!err && message.callback_id === 'initialization_setup_dialog') {
                  bot.reply(message, 'Hi! If you want to learn what I can do, just type `@Alice help`.', () => sendUsage(bot, message, ''));
                }
              });
              logger.info(`Configuration for team ${team.id} (${team.domain}) changed by user ${user.id} (${user.name})`,
                getEventMetadata(rawMessage, 'configuration_changed'));

              bot.dialogOk();
            })
            .catch(err => {
              bot.reply(message, 'Unknown error occurred while saving configuration, please try again later or contact support.');
              logger.error(`Failed to save configuration for team ${team.id} (${team.domain})`, err,
                getEventMetadata(rawMessage, 'configuration_change_failed'));
            });
        })
        .catch(() => sendInvalidConfigurationError(bot));
    });
  }

}

module.exports = SetupDialogHandler;
