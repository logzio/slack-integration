import Command from "../core/commands/Command";
import CommandsRegistry from "../core/commands/CommandsRegistry";

function addCommandUsage(usage, command) {
  const commandUsage = command.getUsage();
  if (typeof commandUsage === 'string') {
    usage.push(commandUsage);
  } else {
    commandUsage.forEach(usageLine => usage.push(usageLine))
  }
}

export default class HelpCommand extends Command {

  configure(controller) {
    controller.hears([/help/, /help [\w-]+/], 'direct_message,direct_mention', function (bot, message) {
      let query = '';
      const matches = message.text.match(/help ([\w\-]+)/);
      if (matches !== null) {
        query = matches[1];
      }

      const usageLines = [];
      CommandsRegistry.getCommands()
        .filter(command => command.getCategory().includes(query))
        .forEach(command => addCommandUsage(usageLines, command));

      if (usageLines.length === 0) {
        bot.reply(message, `No available commands match ${query}`);
        return;
      }

      bot.reply(message, usageLines.join('\n'));
    });

  }


  getCategory() {
    return 'help';
  }

  getUsage() {
    return [
      '*help* - Displays all available help commands.',
      '*help <query>* - Displays all help commands that match <query>.',
    ];
  }


}
