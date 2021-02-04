const Command = require('../core/commands/command');

class HelpCommand extends Command {
  getCategory() {
    return 'help';
  }

  getUsage() {
    return [
      '*help* - Show help for all commands',
      '*help &lt;query&gt;* - Show help for commands that include the query'
    ];
  }
}

module.exports = HelpCommand;
