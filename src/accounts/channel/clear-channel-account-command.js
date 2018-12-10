const Command = require('../../core/commands/command');

const commandRegex = /clear channel account/;

class ClearChannelAccountCommand extends Command {
  constructor(defaultHandler) {
    super();
    this.defaultHandler = defaultHandler;
  }

  configure(controller) {
    controller.hears([commandRegex], 'direct_message,direct_mention', (bot, message) => {
      this.defaultHandler.clearDefault(message.team, message.channel);
      bot.reply(message, `Okay, I cleared the channel account.`)
    });
  }

  getCategory() {
    return 'channel configuration';
  }

  getUsage() {
    return [
      '*clear channel account* - Clear the default account for this channel.',
    ];
  }

}

module.exports = ClearChannelAccountCommand;
