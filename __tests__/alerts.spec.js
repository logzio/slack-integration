const GlobalConfiguration = require('../src/core/utils/globalTestConfigurationSetup');
const CommandName = require('./commandName');
const TestFunctions = require('./testFunctions');
const AlertsCommand = require('../src/alerts/show-alert-command');
const userId = 'u_mixed1';
const teamId = 't_mixed';
const alias1 = 'md178';
const alias2 = 'md278';

const responseByName = {
  statusCode: 200,
  body: [
    {
      alertId: 400,
      severity: 'MEDIUM',
      title: 'Change in user plan',
      isEnabled: false
    },
    {
      alertId: 401,
      severity: 'HIGH',
      title: 'Services rejected queries',
      isEnabled: true
    },
    {
      alertId: 403,
      severity: 'HIGH',
      title: 'multiple alerts example',
      isEnabled: true
    },
    {
      alertId: 402,
      severity: 'HIGH',
      title: 'multiple alerts example',
      isEnabled: true
    },
    {
      alertId: 403,
      severity: 'HIGH',
      title: 'one title with many results',
      isEnabled: true
    },
    {
      alertId: 404,
      severity: 'HIGH',
      title: 'one title with many results 2',
      isEnabled: true
    }
  ]
};

const responseByName2 = {
  statusCode: 200,
  body: [
    {
      alertId: 4012,
      severity: 'MEDIUM',
      title: 'Change in user plan2',
      isEnabled: false
    },
    {
      alertId: 4012,
      severity: 'HIGH',
      title: 'Services rejected queries2',
      isEnabled: true
    },
    {
      alertId: 4032,
      severity: 'HIGH',
      title: 'multiple alerts example2',
      isEnabled: true
    },
    {
      alertId: 4022,
      severity: 'HIGH',
      title: 'multiple alerts example2',
      isEnabled: true
    },
    {
      alertId: 4032,
      severity: 'HIGH',
      title: 'one title with many results2',
      isEnabled: true
    },
    {
      alertId: 4042,
      severity: 'HIGH',
      title: 'one title with many results 22',
      isEnabled: true
    }
  ]
};

const responseById = {
  statusCode: 200,
  statusText: 'ok',
  body: {
    message: 'ok',
    alertId: 400,
    severity: 'MEDIUM',
    title: 'security-feature-failed ssh logins to the same ip',
    description:
      'security-feature-failed ssh logins to the same ip description',
    isEnabled: true
  }
};

describe('get alerts', () => {
  const globalTestConfiguration = new GlobalConfiguration();
  const channelId = globalTestConfiguration.openChannelId;

  it('create account and then try to get alert with wrong alias', done => {
    globalTestConfiguration.bot
      .usersInput(
        TestFunctions.createOneAccount(
          userId,
          teamId,
          channelId,
          'mixed-1-api-token',
          'us-east-1',
          alias1
        )
      )
      .then(message =>
        expect(message.text).toBe(
          `Okay, you\'re ready to use ${alias1} in Slack!`
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.getAliasAlertByName(
            userId,
            teamId,
            channelId,
            'Change in user plan',
            alias2
          )
        )
      )
      .then(message =>
        expect(message.text).toBe(
          "Sorry, there isn't an account with that alias. If you want to see your accounts, type `@Alice accounts`."
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.showAliasAlertByName(
            userId,
            teamId,
            channelId,
            'Change in user plan',
            alias2
          )
        )
      )
      .then(message =>
        expect(message.text).toBe(
          "Sorry, there isn't an account with that alias. If you want to see your accounts, type `@Alice accounts`."
        )
      )
      .then(() => {
        done();
      });
  });

  it('create two accounts and get alert by name with alias', done => {
    globalTestConfiguration.bot
      .usersInput(
        TestFunctions.createOneAccount(
          userId,
          teamId,
          channelId,
          'mixed-1-api-token',
          'us-east-1',
          alias1
        )
      )
      .then(message =>
        expect(message.text).toBe(
          `Okay, you\'re ready to use ${alias1} in Slack!`
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.createOneAccount(
            userId,
            teamId,
            channelId,
            'mixed-2-api-token',
            'us-east-1',
            alias2
          )
        )
      )
      .then(message =>
        expect(message.text).toBe(
          `Okay, you\'re ready to use ${alias2} in Slack!`
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.getAliasAlertByName(
            userId,
            teamId,
            channelId,
            'Change in user plan',
            alias1
          )
        )
      )
      .then(alertMessage =>
        TestFunctions.validateAlertResults(alertMessage, responseByName)
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.getAliasAlertByName(
            userId,
            teamId,
            channelId,
            'Change in user plan2',
            alias2
          )
        )
      )
      .then(alertMessage =>
        TestFunctions.validateAlertResults(alertMessage, responseByName2)
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.showAliasAlertByName(
            userId,
            teamId,
            channelId,
            'Change in user plan',
            alias1
          )
        )
      )
      .then(alertMessage =>
        TestFunctions.validateAlertResults(alertMessage, responseByName)
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.showAliasAlertByName(
            userId,
            teamId,
            channelId,
            'Change in user plan2',
            alias2
          )
        )
      )
      .then(alertMessage =>
        TestFunctions.validateAlertResults(alertMessage, responseByName2)
      )
      .then(() => {
        done();
      });
  });


  it('get alert by name', done => {
    globalTestConfiguration.bot
      .usersInput(
        TestFunctions.createOneAccount(
          userId,
          teamId,
          channelId,
          'mixed-1-api-token',
          'us-east-1',
          alias1
        )
      )
      .then(message =>
        expect(message.text).toBe(
          `Okay, you\'re ready to use ${alias1} in Slack!`
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.createOneAccount(
            userId,
            teamId,
            channelId,
            'mixed-2-api-token',
            'us-east-1',
            alias2
          )
        )
      )
      .then(message =>
        expect(message.text).toBe(
          `Okay, you\'re ready to use ${alias2} in Slack!`
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.getAlertByName(
            userId,
            teamId,
            channelId,
            'Change in user plan'
          )
        )
      )
      .then(alertMessage =>
        TestFunctions.validateAlertResults(alertMessage, responseByName)
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.showAlertByName(
            userId,
            teamId,
            channelId,
            'Change in user plan'
          )
        )
      )
      .then(alertMessage =>
        TestFunctions.validateAlertResults(alertMessage, responseByName)
      )
      .then(() => {
        done();
      });
  });

  it('create account and then try to get alert with wrong alias', done => {
    globalTestConfiguration.bot
      .usersInput(
        TestFunctions.createOneAccount(
          userId,
          teamId,
          channelId,
          'mixed-1-api-token',
          'us-east-1',
          alias1
        )
      )
      .then(message =>
        expect(message.text).toBe(
          `Okay, you\'re ready to use ${alias1} in Slack!`
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.getAliasAlertByName(userId, teamId, channelId, alias2)
        )
      )
      .then(message =>
        expect(message.text).toBe(
          "Sorry, there isn't an account with that alias. If you want to see your accounts, type `@Alice accounts`."
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.showAliasAlertByName(userId, teamId, channelId, alias2)
        )
      )
      .then(message =>
        expect(message.text).toBe(
          "Sorry, there isn't an account with that alias. If you want to see your accounts, type `@Alice accounts`."
        )
      )
      .then(() => {
        done();
      });
  });

  it('create account and then try to get alert with wrong alert name', done => {
    globalTestConfiguration.bot
      .usersInput(
        TestFunctions.createOneAccount(
          userId,
          teamId,
          channelId,
          'mixed-1-api-token',
          'us-east-1',
          alias1
        )
      )
      .then(message =>
        expect(message.text).toBe(
          `Okay, you\'re ready to use ${alias1} in Slack!`
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.getAliasAlertByName(
            userId,
            teamId,
            channelId,
            "Can't find this?",
            alias1
          )
        )
      )
      .then(message =>
        expect(message.text).toBe(
          "Failed to get details for alert with title: Can't find this?"
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.showAliasAlertByName(
            userId,
            teamId,
            channelId,
            "Can't find this?",
            alias1
          )
        )
      )
      .then(message =>
        expect(message.text).toBe(
          "Failed to get details for alert with title: Can't find this?"
        )
      )
      .then(() => {
        done();
      });
  });

  it('Failed on multiple alerts found', done => {
    globalTestConfiguration.bot
      .usersInput(
        TestFunctions.createOneAccount(
          userId,
          teamId,
          channelId,
          'mixed-1-api-token',
          'us-east-1',
          alias1
        )
      )
      .then(message =>
        expect(message.text).toBe(
          `Okay, you\'re ready to use ${alias1} in Slack!`
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.getAliasAlertByName(
            userId,
            teamId,
            channelId,
            'multiple alerts example',
            alias1
          )
        )
      )
      .then(message =>
        expect(message.text).toBe(
          'Failed to get details for alert with title: multiple alerts example'
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.showAliasAlertByName(
            userId,
            teamId,
            channelId,
            'multiple alerts example',
            alias1
          )
        )
      )
      .then(message =>
        expect(message.text).toBe(
          'Failed to get details for alert with title: multiple alerts example'
        )
      )
      .then(() => {
        done();
      });
  });

  const alertId = 400;
  it('get alert by id', done => {
    globalTestConfiguration.bot
      .usersInput(
        TestFunctions.createOneAccount(
          userId,
          teamId,
          channelId,
          'mixed-1-api-token',
          'us-east-1',
          alias1
        )
      )
      .then(message =>
        expect(message.text).toBe(
          `Okay, you\'re ready to use ${alias1} in Slack!`
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.getAlertById(userId, teamId, channelId, alertId)
        )
      )
      .then(alertMessage => {
        expect(alertMessage.attachments[0].title).toBe(
          `${responseById.body.title}`
        );
        expect(alertMessage.attachments[0].text).toBe(
          `${responseById.body.description}`
        );
        expect(alertMessage.attachments[0].fields[0].value).toBe(
          AlertsCommand.ucFirst(responseById.body.severity)
        );
        expect(alertMessage.attachments[0].fields[1].value).toBe(
          AlertsCommand.ucFirst(responseById.body.isEnabled.toString())
        );
      })
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.getAlertById(userId, teamId, channelId, alertId + 1)
        )
      )
      .then(message =>
        expect(message.text).toBe(
          'Failed to get details for alert with id: 401'
        )
      )
      .then(() => {
        done();
      });
  });

  beforeAll(async done => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;
    var handlers = [
      {
        method: 'get',
        url: '/v1/alerts',
        handlerName: 'alertsByName'
      },
      {
        method: 'get',
        url: `/v1/alerts/${alertId}`,
        handlerName: 'alertsById'
      }
    ];

    const handlersReturnValues = new Object();
    handlersReturnValues['alertsByName'] = {};
    handlersReturnValues['alertsByName']['mixed-1-api-token'] = responseByName;
    handlersReturnValues['alertsByName']['mixed-2-api-token'] = responseByName2;

    handlersReturnValues['alertsById'] = {};
    handlersReturnValues['alertsById']['mixed-1-api-token'] = responseById;

    await globalTestConfiguration.beforeAll(
      handlers,
      handlersReturnValues,
      true
    );
    await globalTestConfiguration.mockFirstInstall(
      teamId,
      userId,
      'Logz.io Mixed1',
      undefined,
      'xoxb-357770700357',
      'xoxp-8241711843-408'
    );
    done();
  });

  beforeEach(async () => {
    const kibanaClient = globalTestConfiguration.createKibanaClientMock([]);
    await globalTestConfiguration.initBeforeEach(
      kibanaClient,
      CommandName.SETUP
    );
  });

  afterAll(done => {
    globalTestConfiguration.afterAll(done);
  });
  afterEach(() => {
    globalTestConfiguration.afterEach();
  });
});
