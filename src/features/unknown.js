const LoggerFactory = require('../core/logging/logger-factory');
const { getEventMetadata } = require('../core/logging/logging-metadata');
const { sendUsage } = require('../help/usage-message-supplier');

const logger = LoggerFactory.getLogger(__filename);

module.exports = function(controller) {
  controller.hears(
    [/.*/],
    'direct_message,direct_mention',
    async (bot, message) => {
      const userCommand = message.text;
      logger.info(
        `User ${message.user} from team ${message.team} entered unknown command: ${userCommand}`,
        getEventMetadata(message, 'user-entered-unknown-command')
      );

      await bot.reply(message, `Unrecognized command: ${userCommand}`, () =>
        sendUsage(bot, message, '')
      );
    }
  );
};
