
class TestFunctions {


  static getAccounts(userId,teamId,channelId) {
    return [
      {
        user: userId, channel: channelId, team: teamId,
        messages: [
          {
            text: 'accounts',
            isAssertion: true,
            team: teamId
          }]
      }];
  }

  static createOneAccount(userId, teamId, channelId, apiToken, region, alias){
    return [TestFunctions.createNewAccount(userId, teamId, channelId, apiToken, region, alias)];
  }

  static createNewAccount(userId, teamId, channelId, apiToken, region, alias) {
    return {
      user: userId,
      channel: channelId,
      messages: [
        {team: {id: teamId}, text: 'add account'},
        {team: {id: teamId}, text: 'yes'},
        {
          raw_message:
            {
              team: {id: teamId, domain: 'logzio'},
              user: {id: userId, name: 'userId'},
              channel: {
                "id": channelId,
                "name": "directmessage"
              },
            },

          team: {id: teamId},
          type: 'dialog_submission',
          callback_id: 'setup_dialog',
          submission: {accountRegion: region, apiToken: apiToken, alias: alias},
          text: 'Save',
          isAssertion: true
        }
      ]
    };
  }

  static removeAccount(userId,teamId,alias,channelId) {
    let request = [{
      user: userId,
      channel: channelId,

      messages: [
        {team: teamId, text: `remove account ${alias}`,isAssertion:true},
      ]
    }];
    return request;
  }

  static removeAccountWithoutAlias(userId,teamId,channelId) {
    let request = [{
      user: userId,
      channel: channelId,

      messages: [
        {team: teamId, text: `remove account`,isAssertion:true},
      ]
    }];
    return request;
  }

  static confirm(userId,teamId,alias,channelId,confirm) {
    let request = [{
      user: userId,
      channel: channelId,
      team: teamId,
      messages: [
        {team: {id: teamId}, text: confirm , isAssertion:true},
      ]
    }];
    return request;
  }

  static setChannelAccount(userId,teamId,channelId,alias) {
    return [{
      user: userId, channel: channelId, team: teamId,
      messages: [{
        text: `set channel account ${alias}`,
        isAssertion: true,
        team: teamId
      }]
    }];
  }



  static aliaGetTriggers(userId,teamId,channelId,alias) {
    return [{
      user: userId, channel: channelId, team: teamId,
      messages: [{
        text: `${alias} get triggered alerts`,
        isAssertion: true,
        team: teamId
      }]
    }];
  }

}

module.exports = TestFunctions;
