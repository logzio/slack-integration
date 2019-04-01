const AlertsCommand = require('../src/alerts/show-alert-command');
class TestFunctions {
  static getAccounts(userId, teamId, channelId) {
    return [
      {
        user: userId,
        channel: channelId,
        team: teamId,
        messages: [
          {
            text: 'accounts',
            isAssertion: true,
            team: teamId
          }
        ]
      }
    ];
  }

  static createOneAccount(userId, teamId, channelId, apiToken, region, alias) {
    return [
      TestFunctions.createNewAccount(
        userId,
        teamId,
        channelId,
        apiToken,
        region,
        alias
      )
    ];
  }

  static createNewAccount(userId, teamId, channelId, apiToken, region, alias) {
    return {
      user: userId,
      channel: channelId,
      messages: [
        { team: { id: teamId }, text: 'add account',timeout:1000},
        { team: { id: teamId }, text: 'add-yes' ,timeout:1000},
        {
          raw_message: {
            team: { id: teamId, domain: 'logzio' },
            user: { id: userId, name: 'userId' },
            channel: {
              id: channelId,
              name: 'directmessage'
            }
          },

          team: { id: teamId },
          type: 'dialog_submission',
          callback_id: 'setup_dialog',
          submission: {
            accountRegion: region,
            apiToken: apiToken,
            alias: alias
          },
          text: 'Save',
          isAssertion: true
        }
      ]
    };
  }

  static removeAccount(userId, teamId, alias, channelId) {
    let request = [
      {
        user: userId,
        channel: channelId,

        messages: [
          { team: teamId, text: `remove account ${alias}`, isAssertion: true }
        ]
      }
    ];
    return request;
  }

  static removeAccountWithoutAlias(userId, teamId, channelId) {
    let request = [
      {
        user: userId,
        channel: channelId,

        messages: [{ team: teamId, text: `remove account`, isAssertion: true }]
      }
    ];
    return request;
  }

  static confirm(userId, teamId, alias, channelId, confirm) {
    let request = [
      {
        user: userId,
        channel: channelId,
        team: teamId,
        messages: [{ team: { id: teamId }, text: confirm, isAssertion: true }]
      }
    ];
    return request;
  }

  static setChannelAccount(userId, teamId, channelId, alias) {
    return [
      {
        user: userId,
        channel: channelId,
        team: teamId,
        messages: [
          {
            text: !alias
              ? 'set channel account'
              : `set channel account ${alias}`,
            isAssertion: true,
            team: teamId
          }
        ]
      }
    ];
  }

  static getChannelAccount(userId, teamId, channelId) {
    return [
      {
        user: userId,
        channel: channelId,
        team: teamId,
        messages: [
          {
            text:'get channel account',
            isAssertion: true,
            team: teamId
          }
        ]
      }
    ];
  }

  static clearChannelAccount(userId, teamId, channelId) {
    return [
      {
        user: userId,
        channel: channelId,
        team: teamId,
        messages: [
          {
            text: 'clear channel account',
            isAssertion: true,
            team: teamId
          }
        ]
      }
    ];
  }

  static setWorkspaceAccount(userId, teamId, channelId, alias) {
    return [
      {
        user: userId,
        channel: channelId,
        team: teamId,
        messages: [
          {
            text: !alias
              ? 'set workspace account'
              : `set workspace account ${alias}`,
            isAssertion: true,
            team: teamId
          }
        ]
      }
    ];
  }

  static setWorkspaceAccountWithoutAlias(userId, teamId, channelId) {
    return this.setWorkspaceAccount(userId, teamId, channelId);
  }

  static setChannelAccountWithoutAlias(userId, teamId, channelId) {
    return this.setChannelAccount(userId, teamId, channelId);
  }

  static aliaGetTriggers(userId, teamId, channelId, alias) {
    return [
      {
        user: userId,
        channel: channelId,
        team: teamId,
        messages: [
          {
            text: `${alias} get triggered alerts`,
            isAssertion: true,
            team: teamId
          }
        ]
      }
    ];
  }

  static getTriggers(userId, teamId, channelId) {
    return [
      {
        user: userId,
        channel: channelId,
        team: teamId,
        messages: [
          {
            text: `get triggered alerts`,
            isAssertion: true,
            team: teamId
          }
        ]
      }
    ];
  }

  static getAlertByName(userId, teamId, channelId, alertName) {
    let request = [
      {
        user: userId,
        channel: channelId,
        messages: [
          { team: teamId, text: `get alert ${alertName}`, isAssertion: true }
        ]
      }
    ];
    return request;
  }

  static getFromKibana(userId, teamId, channelId, objectType) {
    let request = [
      {
        user: userId,
        channel: channelId,
        messages: [
          { team: teamId, text: `get kibana ${objectType}`, isAssertion: true }
        ]
      }
    ];
    return request;
  }

  static getFromKibanaWithAlias(userId, teamId, channelId, objectType, alias) {
    let request = [
      {
        user: userId,
        channel: channelId,
        messages: [
          { team: teamId, text: `${alias} get kibana ${objectType}`, isAssertion: true }
        ]
      }
    ];
    return request;
  }


  static showAlertByName(userId, teamId, channelId, alertName) {
    let request = [
      {
        user: userId,
        channel: channelId,
        messages: [
          { team: teamId, text: `show alert ${alertName}`, isAssertion: true }
        ]
      }
    ];
    return request;
  }

  static getAliasAlertByName(userId, teamId, channelId, alertName, alias) {
    let request = [
      {
        user: userId,
        channel: channelId,
        messages: [
          {
            team: teamId,
            text: `${alias} get alert ${alertName}`,
            isAssertion: true
          }
        ]
      }
    ];
    return request;
  }

  static getAlertById(userId, teamId, channelId, id) {
    let request = [
      {
        user: userId,
        channel: channelId,
        messages: [
          { team: teamId, text: `get alert by id ${id}`, isAssertion: true }
        ]
      }
    ];
    return request;
  }

  static listTriggers(userId, teamId, channelId) {
    return [
      {
        user: userId,
        channel: channelId,
        team: teamId,
        messages: [
          {
            text: `get triggered alerts`,
            isAssertion: true,
            team: teamId
          }
        ]
      }
    ];
  }

  static aliaListTriggers(userId, teamId, channelId, alias) {
    return [
      {
        user: userId,
        channel: channelId,
        team: teamId,
        messages: [
          {
            text: `${alias} list triggered alerts`,
            isAssertion: true,
            team: teamId
          }
        ]
      }
    ];
  }

  static search(userId, teamId, channelId, text, suffix) {
    let request = [
      {
        user: userId,
        channel: channelId,
        messages: [
          {
            team: teamId,
            text: `search \`${text}\` ${suffix}`,
            isAssertion: true
          }
        ]
      }
    ];
    return request;
  }

  static searchWithAlias(userId, teamId, channelId, text, suffix, alias) {
    let request = [
      {
        user: userId,
        channel: channelId,
        messages: [
          {
            team: teamId,
            text: `${alias} search \`${text}\` ${suffix}`,
            isAssertion: true
          }
        ]
      }
    ];
    return request;
  }

  static validateAlertResults(alertMessage, expectedResponse) {
    expect(alertMessage.attachments[0].title).toBe(
      expectedResponse.body[0].title
    );
    expect(alertMessage.attachments[0].text).toBe(
      expectedResponse.body[0].description
    );
    expect(alertMessage.attachments[0].fields[0].value).toBe(
      AlertsCommand.ucFirst(expectedResponse.body[0].severity)
    );
    expect(alertMessage.attachments[0].fields[1].value).toBe(
      AlertsCommand.ucFirst(expectedResponse.body[0].isEnabled.toString())
    );
  }

  static validateAlertResultsByName(alertMessage, expectedResponse, globalTestConfiguration, alias) {
    expect(alertMessage.text).toBe(`Getting results from \`${alias}\`\n`);
    const content = globalTestConfiguration.bot.api.files.files.content.trim();
    expect(content).toContain(`${expectedResponse.body[0].alertId}`.trim());
    expect(content).toContain(`${expectedResponse.body[0].title}`.trim());
    expect(content).toContain(`${AlertsCommand.ucFirst(expectedResponse.body[0].severity)}`.trim());
    expect(content).toContain(`${AlertsCommand.ucFirst(expectedResponse.body[0].isEnabled.toString())}`.trim());
  }

  static validateTriggeredResults(alertMessage, expectedResponse) {
    expect(alertMessage.attachments[0].title).toBe(
      expectedResponse.body.results[0].name
    );
  }

  static validateKibanaResults(files, typeInput, dashboardsResponse) {
   let type = [typeInput];
    if(typeInput==='objects'){
      type = ['dashboard', 'visualization', 'search'];
    }
    expect(files.filename).toBe(`Kibana objects of the following types: ${type.join(', ')}`)
    for(let i = 0; i < dashboardsResponse.length ; i++){
      expect(files.content.trim()).toContain(`${dashboardsResponse[i].body.hits[0]._source[type[i]].title}`.trim());
    }
  }
}

module.exports = TestFunctions;
