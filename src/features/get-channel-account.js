const commandRegex = /get channel account/;
const teamConfigurationService = require('../core/configuration');
const Messages = require('../core/messages/messages');
const LoggerFactory = require('../core/logging/logger-factory');

const logger = LoggerFactory.getLogger(__filename);

module.exports = function(controller) {
  controller.hears(
    commandRegex,
    'direct_message,direct_mention',
    async (bot, message) => {
      try {
        const channelAccount = await teamConfigurationService.getAccountForChannel(
          message.team,
          message.channel
        );

        if (!channelAccount) {
          await bot.reply(message, Messages.NO_CHANNEL_ACCOUNT);
        } else {
          await bot.reply(
            message,
            Messages.getCurrentChannel(channelAccount.config.alias)
          );
        }
      } catch (err) {
        logger.error(err);
      }
    }
  );
};
