const commandRegex = /clear workspace account/;
const LoggerFactory = require('../core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);
const { getEventMetadata } = require('../core/logging/logging-metadata');
const Messages = require('../core/messages/messages');
const { defaultHandler, clearDefaultCommand } = require('../accounts/default');

module.exports = function(controller) {
  controller.hears(
    [commandRegex],
    'direct_message,direct_mention',
    async (bot, message) => {
      try {
        await defaultHandler.clearDefault(message.team);
        await bot.reply(message, `Okay, I cleared the workspace account.`);
      } catch (err) {
        await clearDefaultCommand.handleError(bot, message, err, async err => {
          logger.warn(
            'Failed to clear workspace account',
            err,
            getEventMetadata(message, 'failed-to-clear-workspace-account')
          );
          await bot.reply(message, Messages.DEFAULT_ERROR_MESSAGE);
        });
      }
    }
  );
};
