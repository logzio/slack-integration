const Command = require('../core/commands/command');
const { sendUsage } = require('./usage-message-supplier');

class UnknownCommand extends Command {

  configure(controller) {
    controller.hears([/.*/], 'direct_message,direct_mention', (bot, message) => {
      bot.reply(message, `Unrecognized command: ${message.text}`, () => {
        sendUsage(bot, message, '');
      });
    });

  }

  getCategory() {
    return 'help';
  }

  getUsage() {
    return [];
  }

}

module.exports = UnknownCommand;
