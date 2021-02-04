const Command = require('../core/commands/command');

class UnknownCommand extends Command {
  getCategory() {
    return 'help';
  }

  getUsage() {
    return [];
  }
}

module.exports = UnknownCommand;
