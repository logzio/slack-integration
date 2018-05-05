const Command = require('../core/commands/command');
const LoggerFactory = require('../core/logging/logger-factory');
const { getEventMetadata } = require('../core/logging/logging-metadata');

const logger = LoggerFactory.getLogger(__filename);

class SetupCommand extends Command {

  constructor(setupDialogSender) {
    super();
    this.setupDialogSender = setupDialogSender;
  }

  configure(controller) {
    controller.hears('setup', 'direct_message,direct_mention', (bot, message) => {
      logger.info(`User ${message.user} from team ${message.team} triggered setup command`, getEventMetadata(message, 'setup'));
      if (message.type !== 'direct_message') {
        bot.reply(message, `<@${message.user}> sending you the configuration options privately.`);
      }

      this.setupDialogSender.sendSetupMessage(bot, message.user);
    });

  }

  getCategory() {
    return 'setup';
  }

  getUsage() {
    return [
      '*setup* - Displays setup dialog.',
    ];
  }

}

module.exports = SetupCommand;
