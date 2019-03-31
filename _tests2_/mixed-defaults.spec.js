const GlobalConfiguration = require('../src/core/utils/globalTestConfigurationSetup');
const CommandName = require('../__tests__/commandName');
const TestFunctions = require('../__tests__/testFunctions');
const Messages = require('../src/core/messages/messages');
const userId = 'u_mixed1';
const teamId = 't_mixed1';
const channelId2 = 'chan2';
const alias1 = 'd1'+Math.random().toString(16).substr(2, 4);
const alias2 = 'd2'+Math.random().toString(16).substr(2, 4);

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

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;

describe('Mixed1', () => {
  const globalTestConfiguration = new GlobalConfiguration();
  const channelId = globalTestConfiguration.openChannelId;
  const pageSize = 5;
  const total = 400;
  const total2 = 200;

  function getTriggers(channelId) {
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

  function validateTriggersResult(
    message,
    expectedPageSize,
    expectedTotal,
    triggersResults,
    alias
  ) {
    expect(message.text).toBe(Messages.getResults(alias)+
      `Displaying ${expectedPageSize} out of ${expectedTotal} events`
    );
    expect(message.attachments[0].title === triggersResults[0].name);
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

  //create two accounts .
  //get triggers => first account triggers.
  //alias of the second account => get second account triggers
  //set workspace account a2
  //get triggers => a2
  //set workspace a1
  //get triggers => a1
  it('workspace defaults 1', done => {
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
        globalTestConfiguration.bot.usersInput(getTriggers(channelId))
      )
      .then(message =>
        validateTriggersResult(message, pageSize, total, triggersResults, alias1)
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.aliaGetTriggers(userId, teamId, channelId, alias2)
        )
      )
      .then(message =>
        validateTriggersResult(message, pageSize, total2, triggersResults2, alias2)
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.setWorkspaceAccount(userId, teamId, channelId2, alias2)
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(getTriggers(channelId))
      )
      .then(message =>
        validateTriggersResult(message, pageSize, total2, triggersResults2,alias2)
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.setWorkspaceAccount(userId, teamId, channelId2, alias1)
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(getTriggers(channelId))
      )
      .then(message =>
        validateTriggersResult(message, pageSize, total, triggersResults,alias1)
      )
      .then(() => done());
  });

  //create two accounts .
  //set channel ch1 account a2.
  //ch1 get triggers => a2
  //ch2 get triggers => a1
  //clear ch1
  //get ch1 triggers => a1
  it('workspace and channel defaults - clear channel', done => {
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
          TestFunctions.setChannelAccount(userId, teamId, channelId2, alias2)
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(getTriggers(channelId2))
      )
      .then(message =>
        validateTriggersResult(message, pageSize, total2, triggersResults2, alias2)
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(getTriggers(channelId))
      )
      .then(message =>
        validateTriggersResult(message, pageSize, total, triggersResults ,alias1)
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.clearChannelAccount(userId, teamId, channelId2)
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(getTriggers(channelId2))
      )
      .then(message =>
        validateTriggersResult(message, pageSize, total, triggersResults,alias1)
      )
      .then(() => done());
  });

  //create two accounts .
  //set workspace account a2.
  //ch1 - get triggers => a2
  //ch2 - get triggers => a2
  //clear workspace
  //get triggers => error
  //set wa a1
  //get triggers => a1
  it('workspace and channel defaults - clear workspace', done => {
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
          TestFunctions.setWorkspaceAccount(userId, teamId, channelId2, alias2)
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(getTriggers(channelId2))
      )
      .then(message =>
        validateTriggersResult(message, pageSize, total2, triggersResults2, alias2)
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(getTriggers(channelId))
      )
      .then(message =>
        validateTriggersResult(message, pageSize, total2, triggersResults2 , alias2)
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.setWorkspaceAccount(userId, teamId, channelId, alias1)
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(getTriggers(channelId2))
      )
      .then(message =>
        validateTriggersResult(message, pageSize, total, triggersResults, alias1)
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(getTriggers(channelId))
      )
      .then(message =>
        validateTriggersResult(message, pageSize, total, triggersResults, alias1)
      )
      .then(() => done());
  });

  it('workspace and channel defaults - 2', done => {
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
          TestFunctions.setWorkspaceAccount(userId, teamId, channelId2, alias2)
        )
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(getTriggers(channelId2))
      )
      .then(message =>
        validateTriggersResult(message, pageSize, total2, triggersResults2, alias2)
      )
      .then(() => done());
  });

  beforeAll(async done => {
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
      'us-east-1',
      'xoxb-357770700357',
      'xoxp-8241711843-408',
      'mixed-1-api-token'
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
  afterEach((done) => {
    globalTestConfiguration.afterEach(done);
  });
});
