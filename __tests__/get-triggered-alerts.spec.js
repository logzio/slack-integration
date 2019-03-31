const GlobalConfiguration = require('../src/core/utils/globalTestConfigurationSetup');
const CommandName = require('./commandName');
const TestFunctions = require('./testFunctions');
const Messages = require('../src/core/messages/messages');
const userId = 'u_mixed1';
const teamId = 't_mixed1';
const alias1 = 'a1'+Math.random().toString(36).substr(2, 4);
const alias2 = 'a2'+Math.random().toString(36).substr(2, 4);
const alias3 = 'a3'+Math.random().toString(36).substr(2, 4);
const alias4 = 'a4'+Math.random().toString(36).substr(2, 4);

describe('Mixed1', () => {
  const globalTestConfiguration = new GlobalConfiguration();
  const channelId = globalTestConfiguration.openChannelId;
  const pageSize = 5;
  const total = 400;
  const total2 = 200;

  function validateTriggersResult(message, expectedPageSize, expectedTotal,alias) {
    expect(message.text).toBe(Messages.getResults(alias) +
      `Displaying ${expectedPageSize} out of ${expectedTotal} events`
    );
    expect(globalTestConfiguration.httpSpy.alerts).toHaveBeenCalledWith(
      jasmine.objectContaining({
        body: jasmine.objectContaining({
          from: 0,
          size: expectedPageSize,
          severity: ['HIGH', 'MEDIUM', 'LOW'],
          sortBy: 'DATE',
          sortOrder: 'DESC'
        })
      })
    );
  }

  it('get/list triggered alerts when there is no account', done => {
    globalTestConfiguration.bot
      .usersInput(TestFunctions.getTriggers(userId, teamId, channelId))
      .then(message =>
        expect(message.text).toBe(
          'Logz.io integration is not configured!\nUse `add account` command to configure the Logz.io integration and try again.'
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.listTriggers(userId, teamId, channelId)
        )
      )
      .then(message =>
        expect(message.text).toBe(
          'Logz.io integration is not configured!\nUse `add account` command to configure the Logz.io integration and try again.'
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.aliaGetTriggers(userId, teamId, channelId, alias2)
        )
      )
      .then(message =>
        expect(message.text).toBe(
          "Sorry, there isn't an account with that alias. If you want to see your accounts, type `@Alice accounts`."
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.aliaListTriggers(userId, teamId, channelId, alias2)
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

  it('get/list triggered alerts', done => {
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
          TestFunctions.getTriggers(userId, teamId, channelId)
        )
      )
      .then(message => validateTriggersResult(message, pageSize, total, alias1))
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.listTriggers(userId, teamId, channelId)
        )
      )
      .then(message => validateTriggersResult(message, pageSize, total, alias1))
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.aliaGetTriggers(userId, teamId, channelId, alias2)
        )
      )
      .then(message => validateTriggersResult(message, pageSize, total2, alias2))
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.aliaListTriggers(userId, teamId, channelId, alias2)
        )
      )
      .then(message => validateTriggersResult(message, pageSize, total2, alias2))
      .then(() => {
        done();
      });
  });


  it('create two accounts with alias1-token1, alias2-token2. then get triggers. then create account with alias1 and token2. get triggers.', done => {
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
          TestFunctions.aliaGetTriggers(userId, teamId, channelId, alias1)
        )
      )
      .then(message => validateTriggersResult(message, pageSize, total, alias1))
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.aliaGetTriggers(userId, teamId, channelId, alias2)
        )
      )
      .then(message => validateTriggersResult(message, pageSize, total2 ,alias2))
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.createOneAccount(
            userId,
            teamId,
            channelId,
            'mixed-2-api-token',
            'us-east-1',
            alias3
          )
        )
      )
      .then(message =>
        expect(message.text).toBe(
          `Okay, you\'re ready to use ${alias3} in Slack!`
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.aliaGetTriggers(userId, teamId, channelId, alias3)
        )
      )
      .then(message => validateTriggersResult(message, pageSize, total2, alias3))
      .then(() => {
        done();
      });
  });

  //
  // it('create account and then try to get triggers with wrong alias', done => {
  //   globalTestConfiguration.bot
  //     .usersInput(
  //       TestFunctions.createOneAccount(
  //         userId,
  //         teamId,
  //         channelId,
  //         'mixed-1-api-token',
  //         'us-east-1',
  //         alias1
  //       )
  //     )
  //     .then(message =>
  //       expect(message.text).toBe(
  //         `Okay, you\'re ready to use ${alias1} in Slack!`
  //       )
  //     )
  //     .then(() =>
  //       globalTestConfiguration.bot.usersInput(
  //         TestFunctions.aliaListTriggers(userId, teamId, channelId, alias2)
  //       )
  //     )
  //     .then(message =>
  //       expect(message.text).toBe(
  //         "Sorry, there isn't an account with that alias. If you want to see your accounts, type `@Alice accounts`."
  //       )
  //     )
  //     .then(() => {
  //       done();
  //     });
  // });

  beforeAll(async done => {
    const triggersResults = [
      {
        alertId: 111,
        name: 'Alert name 111',
        severity: 'MEDIUM'
      },
      {
        alertId: 112,
        name: 'Alert name 112',
        severity: 'LOW'
      },
      {
        alertId: 113,
        name: 'Alert name 113',
        severity: 'MEDIUM'
      },
      {
        alertId: 114,
        name: 'Alert name 114',
        severity: 'MEDIUM'
      },
      {
        alertId: 115,
        name: 'Alert name 115',
        severity: 'MEDIUM'
      }
    ];

    const triggersResults2 = [
      {
        alertId: 211,
        name: 'Alert name 211',
        severity: 'MEDIUM'
      },
      {
        alertId: 212,
        name: 'Alert name 212',
        severity: 'LOW'
      },
      {
        alertId: 213,
        name: 'Alert name 213',
        severity: 'LOW'
      },
      {
        alertId: 214,
        name: 'Alert name 214',
        severity: 'LOW'
      },
      {
        alertId: 215,
        name: 'Alert name 215',
        severity: 'LOW'
      }
    ];

    const alertsReturnValue = {
      statusCode: 200,
      body: {
        message: 'ok',
        pageSize: pageSize,
        from: 0,
        total: total,
        results: triggersResults
      }
    };

    const alertsReturnValue2 = {
      statusCode: 200,
      body: {
        message: 'ok',
        pageSize: pageSize,
        from: 0,
        total: total2,
        results: triggersResults2
      }
    };

    var handlers = [
      {
        method: 'post',
        url: '/v1/alerts/triggered-alerts',
        handlerName: 'alerts'
      }
    ];
    const handlersReturnValues = new Object();
    handlersReturnValues['alerts'] = {};
    handlersReturnValues['alerts']['mixed-1-api-token'] = alertsReturnValue;
    handlersReturnValues['alerts']['mixed-2-api-token'] = alertsReturnValue2;

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

  beforeEach(async (done) => {
    const kibanaClient = globalTestConfiguration.createKibanaClientMock([]);
    await globalTestConfiguration.initBeforeEach(
      kibanaClient,
      CommandName.SETUP
    );
    done();
  });

  afterAll(done => {
    globalTestConfiguration.afterAll(done);
  });
  afterEach(() => {
    globalTestConfiguration.afterEach();
  });
});
