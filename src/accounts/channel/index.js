const ChannelAccountHandler = require('./channel-account-handler');
const ClearChannelAccountCommand = require('./clear-channel-account-command');
const GetChannelAccountCommand = require('./get-channel-account-command');
const SetChannelAccountCommand = require('./set-channel-account-command');

const channelAccountHandler = new ChannelAccountHandler();
const clearChannelAccountCommand = new ClearChannelAccountCommand();
const getChannelAccountCommand = new GetChannelAccountCommand();
const setChannelAccountCommand = new SetChannelAccountCommand(
  channelAccountHandler
);

module.exports = {
  channelAccountHandler,
  getChannelAccountCommand,
  clearChannelAccountCommand,
  setChannelAccountCommand
};
