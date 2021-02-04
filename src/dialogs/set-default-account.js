const { BotkitConversation } = require('botkit');
const { setDefaultCommand } = require('../accounts/default');

module.exports = function(controller) {
  const conversation = new BotkitConversation(
    'set-default-account',
    controller
  );
  conversation.ask(
    'Which account do you want to set as the workspace account?',
    async (response, convo, bot) => {
      await setDefaultCommand.setDefaultWorkspace(
        convo.vars.message,
        bot,
        response
      );
    },
    'default-account'
  );
  controller.addDialog(conversation);
};

// ask(bot, user, teamId, message) {
//   const command = this;
//
//   bot.startConversation(message, (err, convo) => {
//     convo.addQuestion(
//       'Which account do you want to set as the workspace account?',
//       [
//         {
//           default: true,
//           callback: function(response, convo) {
//             command.setDefaultWorkspace(message, bot, response.text, false);
//             convo.stop();
//           }
//         }
//       ],
//       {},
//       'default'
//     );
//     convo.activate();
//   });
// }
