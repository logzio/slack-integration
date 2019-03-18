const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');
const {getEventMetadata} = require('../../core/logging/logging-metadata');

const logger = LoggerFactory.getLogger(__filename);

class AddAccountCommand extends Command {
  constructor() {
    super();
  }

  configure(controller) {
    controller.hears(['setup'], 'direct_message,direct_mention',
      (bot, message) => this.handlePreviousVersionAddAccountRequest(bot, message)
    );
  }

  handlePreviousVersionAddAccountRequest(bot, message) {
    logger.info(
      `User ${message.user} from team ${
        message.team
        } triggered setup command`,
      getEventMetadata(message, 'setup')
    );

    bot.reply(message, `I've been upgraded to work with multiple accounts now, so we replaced \`setup\`. From now on, if you want to add or remove an account, you can type \`@${bot.identity.name} add account\` or \`@${bot.identity.name} remove account\`.`);
  }

  getCategory() {
    return 'configure';
  }

  getUsage() {
    return [];
  }

}


module.exports = AddAccountCommand;
