const addAccountCommand = require('../accounts/add');

module.exports = function(controller) {
  controller.hears(
    ['add account'],
    'direct_message,direct_mention',
    (bot, message) => addAccountCommand.handleAddAccountRequest(bot, message)
  );
};
