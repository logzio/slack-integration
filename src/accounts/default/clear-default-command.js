const Command = require('../../core/commands/command');
const commandRegex = /clear workspace account/;

class ClearWorkspaceAccountCommand extends Command {

  constructor(defaultHandler) {
    super();
    this.defaultHandler = defaultHandler;
  }
  configure(controller) {
    controller.hears([commandRegex], 'direct_message,direct_mention', (bot, message) => {
      this.defaultHandler.clearDefault(message.team);
      bot.reply(message, `Okay, I cleared the workspace account.`)
    });
  }

  getCategory() {
    return 'defaults';
  }

  getUsage() {
    return [
      '*clear workspace account* - Clear the default account for this workspace',
    ];
  }
}

module.exports = ClearWorkspaceAccountCommand;
