const { setChannelAccountCommand } = require('../accounts/channel');
const commandRegex = /set channel account/;
const commandRegexWithAlias = /set channel account (.*)/;

module.exports = function(controller) {
  controller.hears(
    [commandRegexWithAlias],
    'direct_message,direct_mention',
    (bot, message) => {
      let alias = message.match[1];
      setChannelAccountCommand.setChannel(message, bot, alias);
    }
  );

  controller.hears(
    [commandRegex],
    'direct_message,direct_mention',
    async (bot, message) =>
      await bot.beginDialog('set-channel-account', { message })
  );
};
