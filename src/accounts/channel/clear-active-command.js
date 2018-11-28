const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');

const logger = LoggerFactory.getLogger(__filename);
const commandRegex = /clear active account `(.*)`/;

class ClearActiveCommand extends Command {

  constructor(defaultHandler) {
    super();
    this.defaultHandler = defaultHandler;
  }
  configure(controller) {
    controller.hears([commandRegex], 'direct_message,direct_mention', (bot, message) => {
      let alias = message.text.match(commandRegex)[0];
      this.defaultHandler.clearDefault(message.team, message.channel);
      bot.reply(message, `account ${alias} was unset as default`)
    });
  }
}

module.exports(SetDefault);
