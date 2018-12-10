const Command = require('../../core/commands/command');
const commandRegex = /set workspace account (.*)/;

class SetWorkspaceAccountCommand extends Command {

  constructor(defaultHandler) {
    super();
    this.defaultHandler = defaultHandler;
  }
  configure(controller) {
    controller.hears([commandRegex], 'direct_message,direct_mention', (bot, message) => {
      let alias = message.text.match(commandRegex)[0];
      this.defaultHandler.setDefault(message.team, alias);
      bot.reply(message, `Okay, ${alias} is the workspace account now`)
    });
  }
  getCategory() {
    return 'defaults';
  }

  getUsage() {
    return [
      '*set workspace account ${account alias}* - Set a default account for Alice to use for this workspace.',
    ];
  }
}

module.exports = SetWorkspaceAccountCommand;
