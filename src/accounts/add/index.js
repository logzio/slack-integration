const SetupCommand = require('./setup-command');
const AddAccountCommand = require('./add-account-command');
const AddAccountDialogSender = require('./add-dialog-sender');
const AddAccountDialogHandler = require('./add-account-dialog-handler');

const setupCommand = new SetupCommand();
const addAccountDialogSender = new AddAccountDialogSender();
const addAccountDialogHandler = new AddAccountDialogHandler(
  addAccountDialogSender
);
const addAccountCommand = new AddAccountCommand(addAccountDialogSender);

module.exports = {
  addAccountDialogSender,
  addAccountDialogHandler,
  addAccountCommand,
  setupCommand
};
