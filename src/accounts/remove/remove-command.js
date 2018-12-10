const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');
const { getEventMetadata } = require('../../core/logging/logging-metadata');

const logger = LoggerFactory.getLogger(__filename);
const commandRegex = /remove account `(.*)`/;

class RemoveCommand extends Command {

  constructor(removeAccountHandler) {
    super();
    this.removeAccountHandler = removeAccountHandler;
  }

  configure(controller) {
    controller.hears([commandRegex], 'direct_message,direct_mention', (bot, message) => {
      let account = message.text.match(commandRegex)[0];
      logger.info(`User ${message.user} from team ${message.team} triggered remove command on ${account}`, getEventMetadata(message, 'remove account'));
      this.removeAccountHandler.removeAccount(message.team, alias);
      bot.reply(message, `Okay, I removed ${account} from Slack.`)
    });
  }

  getCategory() {
    return 'configure';
  }

  getUsage() {
    return [
      '*remove account* - Remove a Logz.io account from Slack',
    ];
  }

}

module.exports = RemoveCommand;
