const Command = require('../../core/commands/command');

class GetCurrentChannelAccountCommand extends Command {
  constructor() {
    super();
  }

  getCategory() {
    return 'get channel account';
  }

  getUsage() {
    return ['*get channel account* - Get current channel account'];
  }
}

module.exports = GetCurrentChannelAccountCommand;
