const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');

const logger = LoggerFactory.getLogger(__filename);
const commandRegex = /clear workspace account/;

class ClearDefault extends Command {

  constructor(defaultHandler) {
    super();
    this.defaultHandler = defaultHandler;
  }
  configure(controller) {
    controller.hears([commandRegex], 'direct_message,direct_mention', (bot, message) => {
      this.defaultHandler.clearDefault(message.team);
      bot.reply(message, `default account was removed`)
    });
  }

}

module.exports(ClearDefault);
