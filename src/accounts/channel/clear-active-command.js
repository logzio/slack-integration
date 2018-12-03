const Command = require('../../core/commands/command');

const commandRegex = /clear active account/;

class ClearActiveCommand extends Command {
  constructor(defaultHandler) {
    super();
    this.defaultHandler = defaultHandler;
  }

  configure(controller) {
    controller.hears([commandRegex], 'direct_message,direct_mention', (bot, message) => {
      this.defaultHandler.clearDefault(message.team, message.channel);
      bot.reply(message, `channel was cleared of default account`)
    });
  }

  getCategory() {
    return 'channel configuration';
  }

  getUsage() {
    return [
      '*clear active account {account alias}* - clear account for channel.',
    ];
  }

}

module.exports = ClearActiveCommand;
