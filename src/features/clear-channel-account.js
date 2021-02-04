const LoggerFactory = require('../core/logging/logger-factory');
const { getEventMetadata } = require('../core/logging/logging-metadata');
const Messages = require('../core/messages/messages');
const {
  channelAccountHandler,
  clearChannelAccountCommand
} = require('../accounts/channel');

const commandRegex = /clear channel account/;
const logger = LoggerFactory.getLogger(__filename);

module.exports = async function(controller) {
  controller.hears(
    [commandRegex],
    'direct_message,direct_mention',
    async (bot, message) => {
      const { team = null, channel = null } = message;
      const isUsed = await channelAccountHandler.isAccountUsedByChannel(
        team,
        channel
      );
      if (isUsed) {
        try {
          await channelAccountHandler.clearDefault(team, channel);
          await bot.reply(message, `Okay, I cleared the channel account.`);
        } catch (err) {
          clearChannelAccountCommand.handleError(
            bot,
            message,
            err,
            async err => {
              logger.warn(
                'Failed to clear channel account',
                err,
                getEventMetadata(message, 'failed-to-clear-channel-account')
              );
              await bot.reply(message, Messages.DEFAULT_ERROR_MESSAGE);
            }
          );
        }
      } else {
        await bot.reply(
          message,
          `There's no channel account set, so you're good. 😎`
        );
      }
    }
  );
};
