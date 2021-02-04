const Command = require('../../core/commands/command');

class ClearWorkspaceAccountCommand extends Command {
  constructor() {
    super();
  }

  getCategory() {
    return 'defaults';
  }

  getUsage() {
    return [
      // '*clear workspace account* - Clear the default account for this workspace'
    ];
  }
}

module.exports = ClearWorkspaceAccountCommand;
