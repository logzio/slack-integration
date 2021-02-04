const RemoveAccountHandler = require('./remove-account-handler');
const RemoveAccountCommand = require('./remove-command');
const removeAccountHandler = new RemoveAccountHandler();
const removeAccountCommand = new RemoveAccountCommand(removeAccountHandler);

module.exports = { removeAccountHandler, removeAccountCommand };
