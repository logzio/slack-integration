const GlobalConfiguration = require('../core/utils/globalTestConfigurationSetup');
const CommandName = require('../tests/CommandName');
const TestFunctions = require('../core/utils/testFunctions');
const userId = 'u_mixed1';
const teamId = 't_mixed1';
const channelId2 = 'chan2';
const alias1 = 'mixed1';
const alias2 = 'mixed2';



describe('Migration Mixed1',() => {

  const globalTestConfiguration = new GlobalConfiguration();
  const channelId = globalTestConfiguration.openChannelId;
  const pageSize = 5;
  const total = 400;
  const total2 = 200;

  function getTriggers(channelId) {
    return [{ user: userId, channel: channelId, team: teamId,
      messages: [{
        text: `get triggered alerts`,
        isAssertion: true,
        team: teamId
      }]}];
  }


  it('mixed', (done) => {

    let sequence = TestFunctions.createOneAccount(userId, teamId, channelId,'mixed-1-api-token', 'us-east-1', alias1);
    globalTestConfiguration.bot.usersInput(sequence)
      .then((message) =>
        expect(message.text).toBe(`Okay, you\'re ready to use ${alias1} in Slack!`))

      .then(() => globalTestConfiguration.bot.usersInput(TestFunctions.createOneAccount(userId, teamId, channelId,'mixed-2-api-token', 'us-east-1', alias2)))
      .then((message) =>
        expect(message.text).toBe(`Okay, you\'re ready to use ${alias2} in Slack!`))

      .then(() => globalTestConfiguration.bot.usersInput(TestFunctions.getAccounts(userId,teamId,channelId)))
      .then((message) => {
        expect(message.channel).toBe(channelId);
        expect(message.text).toBe(`These are the accounts in this workspace:\n• \`${alias1}\`: Slack alias for Logzio App Test 1 Prod. *This is the default workspace account.*\n• \`${alias2}\`: Slack alias for Logzio App Test 2 Prod.\n`);
       })
       .then(() => globalTestConfiguration.bot.usersInput(getTriggers(channelId)))
       .then((message) => {
          expect(message.text).toBe(`Displaying ${pageSize} out of ${total} events`);
          expect(globalTestConfiguration.httpSpy.alerts).toHaveBeenCalledWith(jasmine.objectContaining({
                      body: jasmine.objectContaining({
                        from: 0,
                        size: pageSize,
                        severity: ["HIGH", "MEDIUM", "LOW"],
                        sortBy: "DATE",
                        sortOrder: "DESC"
                      })
                    }));

       })
      .then(() => globalTestConfiguration.bot.usersInput(TestFunctions.aliaGetTriggers(userId,teamId,channelId,alias2)))
      .then((message) => {
                      expect(message.text).toBe(`Displaying ${pageSize} out of ${total2} events`);
                      expect(globalTestConfiguration.httpSpy.alerts).toHaveBeenCalledWith(jasmine.objectContaining({
                        body: jasmine.objectContaining({
                          from: 0,
                          size: pageSize,
                          severity: ["HIGH", "MEDIUM", "LOW"],
                          sortBy: "DATE",
                          sortOrder: "DESC"
                        })
                      }));

      })

      .then(() => globalTestConfiguration.bot.usersInput(TestFunctions.setChannelAccount(userId,teamId,channelId2,alias2)))
      .then((message) => {
        expect(message.text).toBe(`Okay, '${alias2}' is the channel account now.`);
      })
      .then(() => globalTestConfiguration.bot.usersInput(getTriggers(channelId)))
      .then((message) => {
        expect(message.text).toBe(`Displaying ${pageSize} out of ${total} events`);
        expect(globalTestConfiguration.httpSpy.alerts).toHaveBeenCalledWith(jasmine.objectContaining({
          body: jasmine.objectContaining({
            from: 0,
            size: pageSize,
            severity: ["HIGH", "MEDIUM", "LOW"],
            sortBy: "DATE",
            sortOrder: "DESC"
          })
        }));

      })
      .then(() => globalTestConfiguration.bot.usersInput(getTriggers(channelId2)))
      .then((message) => {
        expect(message.text).toBe(`Displaying ${pageSize} out of ${total2} events`);
        expect(globalTestConfiguration.httpSpy.alerts).toHaveBeenCalledWith(jasmine.objectContaining({
          body: jasmine.objectContaining({
            from: 0,
            size: pageSize,
            severity: ["HIGH", "MEDIUM", "LOW"],
            sortBy: "DATE",
            sortOrder: "DESC"
          })
        }));
      })
      .then(() => globalTestConfiguration.bot.usersInput(TestFunctions.getAccounts(userId,teamId,channelId)))
      .then((message) => {
        expect(message.channel).toBe(channelId);
        expect(message.text).toBe('These are the accounts in this workspace:\n' +
          `• \`${alias1}\`: Slack alias for Logzio App Test 1 Prod. *This is the default workspace account.*\n` +
          `• \`${alias2}\`: Slack alias for Logzio App Test 2 Prod. This is the channel account for <#${channelId2}|${channelId2}_name>.\n`)
      })

      .then(() => globalTestConfiguration.bot.usersInput(TestFunctions.removeAccount(userId,teamId,alias2,channelId)))
      .then((message) => {
        expect(message.attachments[0].text).toBe(`${alias2} is used in these channels:chan2_name. Are you sure you want to remove it from Slack?`);
      })
      .then(() => {
        globalTestConfiguration.bot.usersInput(TestFunctions.confirm(userId,teamId,alias2,channelId,'yes')).then(message => {
          expect(message.text).toBe(`Okay, I removed ${alias2} from Slack.`);
          globalTestConfiguration.bot.usersInput(TestFunctions.aliaGetTriggers(userId,teamId,channelId,alias2))
            .then((message) => {
              expect(message.text).toBe('Sorry, there isn\'t an account with that alias. If you want to see your accounts, type \`@Alice accounts\`.');
              done();
            })
        })
      })

});

  beforeAll(async (done) => {
    const triggersResults = [
      {
        alertId: 111,
        name: "Alert name 111",
        severity: "MEDIUM"
      },
      {
        alertId: 112,
        name: "Alert name 112",
        severity: "LOW"
      },
      {
        alertId: 113,
        name: "Alert name 113",
        severity: "MEDIUM"
      },
      {
        alertId: 114,
        name: "Alert name 114",
        severity: "MEDIUM"
      },
      {
        alertId: 115,
        name: "Alert name 115",
        severity: "MEDIUM"
      }
    ];

    const triggersResults2 = [
      {
        alertId: 211,
        name: "Alert name 211",
        severity: "MEDIUM"
      },
      {
        alertId: 212,
        name: "Alert name 212",
        severity: "LOW"
      }
      ,
      {
        alertId: 213,
        name: "Alert name 213",
        severity: "LOW"
      }
      ,
      {
        alertId: 214,
        name: "Alert name 214",
        severity: "LOW"
      }
      ,
      {
        alertId: 215,
        name: "Alert name 215",
        severity: "LOW"
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
      },
    }

    const alertsReturnValue2= {
      statusCode: 200,
      body: {
        message: 'ok',
        pageSize: pageSize,
        from: 0,
        total: total2,
        results: triggersResults2
      },
    }

    var handlers = [
      {
        method: 'post',
        url: '/v1/alerts/triggered-alerts',
        handlerName: 'alerts'
      }
    ]
    const handlersReturnValues = new Object();
    handlersReturnValues['alerts'] = {}
    handlersReturnValues['alerts']['mixed-1-api-token'] = alertsReturnValue;
    handlersReturnValues['alerts']['mixed-2-api-token'] = alertsReturnValue2;

    await globalTestConfiguration.beforeAll(handlers,handlersReturnValues,true)
    //id, createdBy, name, region, token, appToken, apiToken, alias
    await globalTestConfiguration.mockFirstInstallForMigration(teamId,userId,'Logz.io Mixed1','us-east-1','xoxb-357770700357','xoxp-8241711843-408','api-token');

    done()
  });

  beforeEach(async () => {
    const kibanaClient = globalTestConfiguration.createKibanaClientMock([]);
    await globalTestConfiguration.initBeforeEach(kibanaClient, CommandName.SETUP);
  });

  afterAll(done => { globalTestConfiguration.afterAll(done);});
  afterEach(() => {globalTestConfiguration.afterEach();});

});
