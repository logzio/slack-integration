const { BotkitConversation } = require('botkit');

module.exports = function(controller) {
  const conversation = new BotkitConversation('remove-account', controller);
  // conversation.ask()

  await bot.startPrivateConversation({ user }, (err, convo) => {
    convo.addMessage(
      {
        text: canDeleteDefault
          ? Messages.REMOVED_ACCOUNT_MESSAGE
          : `Okay, I removed ${alias} from Slack.`
      },
      'successfully_removed_thread'
    );

    convo.addMessage(
      {
        text: canDeleteDefault
          ? Messages.I_WONT_REMOVE_ACCOUNT
          : `Okay, ${alias} is still active.`
      },
      'canceled'
    );

    convo.addMessage(
      {
        text: `Failed to remove account`
      },
      'error'
    );

    convo.addQuestion(
      messageWithButtons,
      [
        {
          pattern: 'remove-yes',
          callback: function(response, convo) {
            const remove = shouldDeleteDefault
              ? teamConfigService.removeDefaultAccount(teamId, alias)
              : teamConfigService.removeAccount(teamId, alias);
            return remove.then(res => {
              if (res) {
                convo.gotoThread('successfully_removed_thread');
              } else {
                convo.gotoThread('error');
              }
            });
          }
        },
        {
          pattern: 'remove-no',
          callback: function(response, convo) {
            convo.gotoThread('canceled');
          }
        },
        {
          default: true,
          callback: function(response, convo) {
            convo.gotoThread('canceled');
          }
        }
      ],
      {}
    );
    convo.activate();
  });
}
