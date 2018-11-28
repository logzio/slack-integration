const Command = require('../../core/commands/command');
const LoggerFactory = require('../../core/logging/logger-factory');

const logger = LoggerFactory.getLogger(__filename);
const commandRegex = /set active `(.*)`/;

class SetActiveCommand extends Command {

  constructor(channelHandler) {
    super();
    this.channelHandler = channelHandler;
  }
  configure(controller) {
    controller.hears([commandRegex], 'direct_message,direct_mention', (bot, message) => {
      if (message.type === 'direct_message') {
        bot.reply(message, "only allowed on channels");
        return;
      }
      let alias = message.text.match(commandRegex)[0];
      this.channelHandler.setDefault(message.team, message.channel, alias);
      bot.reply(message, `account ${alias} was set as default for channel ${message.channel}`)
    });
  }
}

module.exports(SetActiveCommand);