const Command = require('../core/commands/command');
const LoggerFactory = require('../core/logging/logger-factory');
const { getEventMetadata } = require('../core/logging/logging-metadata');
const { sendUsage } = require('./usage-message-supplier');

const logger = LoggerFactory.getLogger(__filename);

class UnknownCommand extends Command {

  configure(controller) {
    controller.hears([/.*/], 'direct_message,direct_mention', (bot, message) => {
      const userCommand = message.text;
      logger.info(`User ${message.user} from team ${message.team} entered unknown command: ${userCommand}`,
        getEventMetadata(message, 'user-entered-unknown-command'));

      bot.reply(message, `Unrecognized command: ${userCommand}`, () => sendUsage(bot, message, ''));
    });

  }

  getCategory() {
    return 'help';
  }

  getUsage() {
    return [];
  }

}

module.exports = UnknownCommand;
