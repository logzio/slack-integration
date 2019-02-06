const HttpClient = require('../../core/client/http-client');
const ApiExtract = require('../../core/utils/apiExtract');
const shouldDeleteDefaultAccountQuestion = ' is your workspace account. Are you sure you want to remove it from Slack?';
const shouldDeleteAccountWithCurrentChannels = ' is used in these channels:';
const shouldDeleteAccount = 'Are you sure you want to remove '

function getMessageWithButtons(prefix, question, suffix){
  return  {
    attachments: [
      {
        title: '',
        text: prefix + question + suffix,
        callback_id: 'remove-account',
        attachment_type: 'default',
        delete_original: true,
        actions: [{
          text: 'Remove',
          value: 'yes',
          type: 'button',
          name: 'yes',
        }, {
          text: 'Cancel',
          value: 'no',
          type: 'button',
          name: 'no',
        }]
      }
    ]
  };

}


class removeAccountHandler {
  constructor(teamConfigService) {
    this.teamConfigService = teamConfigService;
  }

  removeAccount(teamId, alias, bot, user) {
   return this.teamConfigService.getDefault(teamId)
      .then(configuration => HttpClient.validateConfiguration(configuration))
      .then((teamConfiguration) => {
        if (teamConfiguration.config.alias === alias) {
          const messageWithButtons = getMessageWithButtons(alias, shouldDeleteDefaultAccountQuestion, '');
          this.askForApproval(alias, bot, user, teamId,messageWithButtons, true);
        }else{
          this.teamConfigService.getAliasAccountsUsedByChannel(teamId, alias)
            .then(accounts =>{
             if(accounts.length > 0){
               ApiExtract.extractAccountsChannels(bot, accounts)
                 .then(channelNames =>{
                   const messageWithButtons = getMessageWithButtons(alias, shouldDeleteAccountWithCurrentChannels, channelNames);
                   this.askForApproval(alias, bot, user, teamId,messageWithButtons  , false);
                 })
             }else{
               const messageWithButtons = getMessageWithButtons('', shouldDeleteAccount, alias);
               this.askForApproval(alias, bot, user, teamId, messageWithButtons, false);
             }
          })
        }
      })
  }

  askForApproval(alias, bot, user, teamId , messageWithButtons , shouldDeleteDefault) {

    const teamConfigService = this.teamConfigService;
    bot.startPrivateConversation({user}, (err, convo) => {
      convo.addMessage({
        text: `Okay, I removed ${alias} from Slack.`,
      }, 'successfully_removed_thread');

      convo.addMessage({
        text: `Okay, ${alias} is still active.`,
      }, 'canceled');

      convo.addMessage({
        text: `Failed to remove account`,
      }, 'error');

      convo.addQuestion(messageWithButtons
        , [
          {
            pattern: 'yes',
            callback: function (response, convo) {
              const remove = shouldDeleteDefault? teamConfigService.removeDefaultAccount(teamId, alias) : teamConfigService.removeAccount(teamId, alias);
              remove.then(res =>{
                 if(res){
                   convo.gotoThread('successfully_removed_thread');
                 }else{
                   convo.gotoThread('error');
                 }
              })
            },
          },
          {
            pattern: 'no',
            callback: function (response, convo) {
              convo.gotoThread('canceled');
            },
          },
          {
            default: true,
            callback: function (response, convo) {
              convo.gotoThread('canceled');
            },
          }
        ], {}, 'default');
      convo.activate();
    });
  }
}

module.exports = removeAccountHandler;
