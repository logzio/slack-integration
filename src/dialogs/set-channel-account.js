const { BotkitConversation } = require('botkit');
const { setChannelAccountCommand } = require('../accounts/channel');

module.exports = function(controller) {
  const conversation = new BotkitConversation(
    'set-channel-account',
    controller
  );
  conversation.ask(
    'Which account do you want to set as the channel account?',
    async (response, convo, bot) => {
      setChannelAccountCommand.setChannel(convo.vars.message, bot, response);
    },
    'channel-account'
  );
  controller.addDialog(conversation);
};
