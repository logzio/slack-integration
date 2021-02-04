const Command = require('../../core/commands/command');

class ClearChannelAccountCommand extends Command {
  constructor() {
    super();
  }

  getCategory() {
    return 'channel configuration';
  }

  getUsage() {
    return [
      '*clear channel account* - Clear the default account for this channel'
    ];
  }
}

module.exports = ClearChannelAccountCommand;
