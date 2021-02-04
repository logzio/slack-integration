const LoggerFactory = require('../core/logging/logger-factory');
const { getEventMetadata } = require('../core/logging/logging-metadata');
const { sendUsage } = require('../help/usage-message-supplier');

const logger = LoggerFactory.getLogger(__filename);

module.exports = function(controller) {
  controller.hears(
    [/help ([\w-]+)/, /help$/],
    'direct_message,direct_mention',
    async (bot, message) => {
      logger.info(
        `User ${message.user} from team ${message.team} requested usage list`,
        getEventMetadata(message, 'usage-list')
      );
      let query = message.match[1] || '';
      await sendUsage(bot, message, query);
    }
  );
};
