const LoggerFactory = require('../core/logging/logger-factory');
const TeamConfiguration = require('../core/configuration/team-configuration');
const { getEventMetadata } = require('../core/logging/logging-metadata');

const logger = LoggerFactory.getLogger(__filename);

class SetupDialogHandler {

  constructor(teamConfigService, apiConfig) {
    this.teamConfigService = teamConfigService;
    this.configuredRegions = apiConfig['regions'];
  }

  configure(controller) {
    controller.on('dialog_submission', (bot, message) => {
      if (message.callback_id !== 'setup_dialog') return;

      const submission = message['submission'];

      const accountRegion = submission['accountRegion'];
      const apiToken = submission['apiToken'];

      if (!this.configuredRegions.hasOwnProperty(accountRegion)) {
        bot.dialogError({
          name: 'accountRegion',
          error: 'Invalid account region.'
        });

        return;
      }

      if (!apiToken || apiToken.trim() === '') {
        bot.dialogError({
          name: 'apiToken',
          error: 'Api token cannot be blank.'
        });

        return;
      }

      const config = new TeamConfiguration()
        .setLogzioAccountRegion(accountRegion)
        .setLogzioApiToken(apiToken);

      const rawMessage = message.raw_message;
      const team = rawMessage.team;
      const user = rawMessage.user;

      this.teamConfigService.save(team.id, config)
        .then(() => {
          bot.reply(message, 'Configuration saved!');
          logger.info(`Configuration for team ${team.id} (${team.domain}) changed by user ${user.id} (${user.name})`,
            getEventMetadata(rawMessage, 'configuration_changed'));
        })
        .catch(err => {
          bot.reply(message, 'Unknown error occurred while saving configuration, please try again later or contact support.');
          logger.error(`Failed to save configuration for team ${team.id} (${team.domain})`, err,
            getEventMetadata(rawMessage, 'configuration_change_failed'));
        });

      bot.dialogOk();
    });
  }

}

module.exports = SetupDialogHandler;
