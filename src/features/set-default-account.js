const { setDefaultCommand } = require('../accounts/default');
const commandRegexWithAlias = /set workspace account (.*)/;
const commandRegex = /set workspace account/;

module.exports = function(controller) {
  controller.hears(
    [commandRegexWithAlias],
    'direct_message,direct_mention',
    async (bot, message) => {
      let alias = message.text.match(commandRegexWithAlias)[1];
      await setDefaultCommand.setDefaultWorkspace(message, bot, alias, true);
    }
  );

  controller.hears(
    [commandRegex],
    'direct_message,direct_mention',
    async (bot, message) => {
      await bot.beginDialog('set-default-account', { message });
    }
  );
};
