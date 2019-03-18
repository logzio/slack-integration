const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');
const {getEventMetadata} = require('../../core/logging/logging-metadata');

const logger = LoggerFactory.getLogger(__filename);

class AddAccountCommand extends Command {
  constructor(setupDialogSender) {
    super();
    this.setupDialogSender = setupDialogSender;
  }

  configure(controller) {
    controller.hears(['add account'], 'direct_message,direct_mention',
      (bot, message) => this.handleAddAccountRequest(bot, message)
    );
  }

  handleAddAccountRequest(bot, message) {
    logger.info(
      `User ${message.user} from team ${
        message.team
        } triggered add account command`,
      getEventMetadata(message, 'setup')
    );
    if (message.type !== 'direct_message') {
      bot.reply(
        message,
        `Sending you the configuration options privately <@${
          message.user
          }>`
      );
    }
    this.setupDialogSender.sendSetupMessage(bot, message.user);
  }

  getCategory() {
    return 'configure';
  }

  getUsage() {
    return ['*add account* - Add a new Logz.io account to Slack'];
  }

}


module.exports = AddAccountCommand;
