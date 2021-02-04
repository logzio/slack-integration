const { setupCommand } = require('../accounts/add');

module.exports = function(controller) {
  controller.hears(
    ['setup'],
    'direct_message,direct_mention',
    async (bot, message) =>
      await setupCommand.handlePreviousVersionAddAccountRequest(bot, message)
  );
};
