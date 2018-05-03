const Command = require('../core/commands/command');
const { sendUsage } = require('./usage-message-supplier');

class HelpCommand extends Command {

  configure(controller) {
    controller.hears([/help ([\w-]+)/, /help$/], 'direct_message,direct_mention', (bot, message) => {
      let query = message.match[1] || '';
      sendUsage(bot, message, query);
    });

  }

  getCategory() {
    return 'help';
  }

  getUsage() {
    return [
      '*help* - Displays all available help commands.',
      '*help &lt;query&gt;* - Displays all help commands that match &lt;query&gt;.',
    ];
  }

}

module.exports = HelpCommand;
