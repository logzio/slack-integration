const { getAccountsCommand } = require('../accounts/get');
const { teamConfigurationService } = require('../core/configuration');
const LoggerFactory = require('../core/logging/logger-factory');

const logger = LoggerFactory.getLogger(__filename);

module.exports = function(controller) {
  controller.hears(
    /accounts/,
    'direct_message,direct_mention',
    async (bot, message) => {
      try {
        const allAccountsSafeView = await teamConfigurationService.getAllAccountsSafeView(
          message.team,
          bot
        );
        getAccountsCommand.replayWith(
          allAccountsSafeView.filter(Boolean),
          bot,
          message
        );
      } catch (err) {
        logger.error(err);
      }
    }
  );
};
