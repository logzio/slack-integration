const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');

const logger = LoggerFactory.getLogger(__filename);
const commandRegex = /set workspace account `(.*)`/;

class SetDefault extends Command {

  constructor(defaultHandler) {
    super();
    this.defaultHandler = defaultHandler;
  }
  configure(controller) {
    controller.hears([commandRegex], 'direct_message,direct_mention', (bot, message) => {
      let alias = message.text.match(commandRegex)[0];
      this.defaultHandler.setDefault(message.team, alias);
      bot.reply(message, `account ${alias} was set as default`)
    });
  }
}

module.exports(SetDefault);
