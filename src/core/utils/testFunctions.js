
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
        text: !alias?'set channel account': `set channel account ${alias}`,
        isAssertion: true,
        team: teamId
      }]
    }];
  }

  static clearChannelAccount(userId,teamId,channelId) {
    return [{
      user: userId, channel: channelId, team: teamId,
      messages: [{
        text:'clear channel account',
        isAssertion: true,
        team: teamId
      }]
    }];
  }

  static clearWorkspaceAccount(userId,teamId,channelId) {
    return [{
      user: userId, channel: channelId, team: teamId,
      messages: [{
        text:'clear workspace account',
        isAssertion: true,
        team: teamId
      }]
    }];
  }

  static setWorkspaceAccount(userId,teamId,channelId,alias) {
    return [{
      user: userId, channel: channelId, team: teamId,
      messages: [{
        text: !alias?'set workspace account': `set workspace account ${alias}`,
        isAssertion: true,
        team: teamId
      }]
    }];
  }

  static setWorkspaceAccountWithoutAlias(userId,teamId,channelId) {
    return this.setWorkspaceAccount(userId,teamId,channelId);
  }

  static setChannelAccountWithoutAlias(userId,teamId,channelId) {
    return this.setChannelAccount(userId,teamId,channelId);
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

  static getTriggers(userId,teamId,channelId) {
    return [{ user: userId, channel: channelId, team: teamId,
      messages: [{
        text: `get triggered alerts`,
        isAssertion: true,
        team: teamId
      }]}];
  }

  static getAlertByName(userId,teamId,channelId,alertName) {
    let request = [{
      user: userId,
      channel: channelId,
      messages: [
        {team: teamId, text: `get alert ${alertName}`,isAssertion:true},
      ]
    }];
    return request;
  }

  static showAlertByName(userId,teamId,channelId,alertName) {
    let request = [{
      user: userId,
      channel: channelId,
      messages: [
        {team: teamId, text: `show alert ${alertName}`,isAssertion:true},
      ]
    }];
    return request;
  }

  static showAliasAlertByName(userId,teamId,channelId,alertName,alias) {
    let request = [{
      user: userId,
      channel: channelId,
      messages: [
        {team: teamId, text: `${alias} show alert ${alertName}`,isAssertion:true},
      ]
    }];
    return request;
  }


  static getAliasAlertByName(userId,teamId,channelId,alertName,alias) {
    let request = [{
      user: userId,
      channel: channelId,
      messages: [
        {team: teamId, text: `${alias} get alert ${alertName}`,isAssertion:true},
      ]
    }];
    return request;
  }

  static getAliasById(userId,teamId,channelId,id,alias) {
    let request = [{
      user: userId,
      channel: channelId,
      messages: [
        {team: teamId, text: `${alias} get alert by id ${id}`,isAssertion:true},
      ]
    }];
    return request;
  }

  static getAlertById(userId,teamId,channelId,id) {
    let request = [{
      user: userId,
      channel: channelId,
      messages: [
        {team: teamId, text: `get alert by id ${id}`,isAssertion:true},
      ]
    }];
    return request;
  }





  static listTriggers(userId,teamId,channelId) {
    return [{ user: userId, channel: channelId, team: teamId,
      messages: [{
        text: `get triggered alerts`,
        isAssertion: true,
        team: teamId
      }]}];
  }

  static aliaListTriggers(userId,teamId,channelId,alias) {
    return [{
      user: userId, channel: channelId, team: teamId,
      messages: [{
        text: `${alias} list triggered alerts`,
        isAssertion: true,
        team: teamId
      }]
    }];
  }


  static search(userId,teamId,channelId,text,suffix) {
    let request = [{
      user: userId,
      channel: channelId,
      messages: [
        {team: teamId, text: `search \`${text}\` ${suffix}`,isAssertion:true},
      ]
    }];
    return request;
  }

  static searchWithAlias(userId,teamId,channelId,text,suffix,alias) {
    let request = [{
      user: userId,
      channel: channelId,
      messages: [
        {team: teamId, text: `${alias} search \`${text}\` ${suffix}`,isAssertion:true},
      ]
    }];
    return request;
  }


}

module.exports = TestFunctions;
