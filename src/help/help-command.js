const Command = require('../core/commands/command');
const LoggerFactory = require('../core/logging/logger-factory');
const { getEventMetadata } = require('../core/logging/logging-metadata');
const { sendUsage } = require('./usage-message-supplier');

const logger = LoggerFactory.getLogger(__filename);

class HelpCommand extends Command {
  configure(controller) {
    controller.hears(
      [/help ([\w-]+)/, /help$/],
      'direct_message,direct_mention',
      (bot, message) => {
        logger.info(
          `User ${message.user} from team ${message.team} requested usage list`,
          getEventMetadata(message, 'usage-list')
        );
        let query = message.match[1] || '';
        sendUsage(bot, message, query);
      }
    );
  }

  getCategory() {
    return 'help';
  }

  getUsage() {
    return [
      '*help* - Show help for all commands',
      '*help &lt;query&gt;* - Show help for commands that include the query'
    ];
  }
}

module.exports = HelpCommand;
