const DefaultHandler = require('./default-handler');
const ClearDefaultCommand = require('./clear-default-command');
const SetDefaultCommand = require('./set-default-command');

const defaultHandler = new DefaultHandler();
const clearDefaultCommand = new ClearDefaultCommand();
const setDefaultCommand = new SetDefaultCommand(defaultHandler);

module.exports = { clearDefaultCommand, setDefaultCommand, defaultHandler };
