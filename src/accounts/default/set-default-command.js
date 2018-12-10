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
      bot.reply(message, `Account ${alias} was set as default account for workspace`)
    });
  }
  getCategory() {
    return 'defaults';
  }

  getUsage() {
    return [
      '*set workspace account ${account alias}* - set the currently configured default account for the entire workspace.',
    ];
  }
}

module.exports = SetWorkspaceAccountCommand;
