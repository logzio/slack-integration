const HelpCommand = require('./help-command');
const UnknownCommand = require('./unknown-command');

const helpCommand = new HelpCommand();
const unknownCommand = new UnknownCommand();

module.exports = { helpCommand, unknownCommand };
