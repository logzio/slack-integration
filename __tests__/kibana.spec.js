const GlobalConfiguration = require('../src/core/utils/globalTestConfigurationSetup');
const CommandName = require('./commandName');
const TestFunctions = require('./testFunctions');
const Messages = require('../src/core/messages/messages');
const LoggerFactory = require('../src/core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);
const userId = 'u_mixed1';
const teamId = 't_mixed1';
const alias1 = 'k1'+Math.random().toString(36).substr(2, 4);
const alias2 = 'k2'+Math.random().toString(36).substr(2, 4);


const dashbordsResponse1 = {
  statusCode: 200,
  body:
    {
      kibanaVersion: "6.3.2",
      hits:[
        {
          _index: "logzioTestKibanaIndex",
          _type: "doc",
          _id: "dashboard:Query",
          _score: 2.463584,
          _source: {
          type: "dashboard",
          dashboard: {
            title: "Query",
            hits: 0,
            description: "dashbord1"
                 }
          }
        }
      ]
    }
};

const visualizationResponse1 = {
  statusCode: 200,
  body:
    {
      kibanaVersion: "6.3.2",
      hits:[
        {
          _index: "logzioCustomerKibanaIndex",
          _type: "doc",
          _id: "visualization:E-commerce-App-Transactions-overtime",
          _source: {
            type: "visualization",
            visualization: {
              title: "E-commerce App - Transactions overtime",
            }
          }
        }
      ]
    }
};

const dashbordsResponse2 = {
  statusCode: 200,
  body:
    {
      kibanaVersion: "6.3.2",
      hits:[
        {
          _index: "logzioTestKibanaIndex",
          _type: "doc",
          _id: "dashboard:Query",
          _score: 2.463584,
          _source: {
            type: "dashboard",
            dashboard: {
              title: "Query2",
              hits: 0,
              description: "dashbord1"
            }
          }
        }
      ]
    }
};

const visualizationResponse2 = {
  statusCode: 200,
  body:
    {
      kibanaVersion: "6.3.2",
      hits:[
        {
          _index: "logzioCustomerKibanaIndex",
          _type: "doc",
          _id: "visualization:E-commerce-App-Transactions-overtime2",
          _source: {
            type: "visualization",
            visualization: {
              title: "E-commerce App - Transactions overtime2",
            }
          }
        }
      ]
    }
};


const searchResponse1 = {
  statusCode: 200,
  body:
    {
      kibanaVersion: "6.3.2",
      hits:[
        {
          _index: "logzioCustomerKibanaIndex",
          _type: "doc",
          _id: "search:Webapp-Transactions",
          _score: 2.2610013,
          _source: {
            type: "search",
            search: {
              title: "Webapp-Transactions",
              description: "",
              hits: 0,
              columns: [
                "message"
              ],
              sort: [
                "@timestamp",
                "desc"
              ],
              version: 1,
              kibanaSavedObjectMeta: {
                "searchSourceJSON": "{\"index\":\"[logzioCustomerIndex]YYMMDD\",\"highlight\":{\"pre_tags\":[\"@kibana-highlighted-field@\"],\"post_tags\":[\"@/kibana-highlighted-field@\"],\"fields\":{\"*\":{}},\"fragment_size\":2147483647},\"filter\":[{\"meta\":{\"negate\":false,\"index\":\"[logzioCustomerIndex]YYMMDD\",\"key\":\"type\",\"value\":\"webapp-transaction\",\"disabled\":false},\"query\":{\"match\":{\"type\":{\"query\":\"webapp-transaction\",\"type\":\"phrase\"}}}}]}"
              }
            }
          }
        },
      ]
    }
};

const searchResponse2 = {
  statusCode: 200,
  body:
    {
      kibanaVersion: "6.3.2",
      hits:[
        {
          _index: "logzioCustomerKibanaIndex",
          _type: "doc",
          _id: "search:Webapp-Transactions2",
          _score: 2.2610013,
          _source: {
            type: "search",
            search: {
              title: "Webapp-Transactions2",
              description: "",
              hits: 0,
              columns: [
                "message"
              ],
              sort: [
                "@timestamp",
                "desc"
              ],
              version: 1,
            }
          }
        },
      ]
    }
};


const dashbordsResponseNoResults = {
  statusCode: 200,
  body:
    {
      kibanaVersion: "6.3.2",
      hits:[
      ]
    }
};

function testGetFromKibana(globalTestConfiguration, channelId, done, type ,response1 ,response2) {
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
        TestFunctions.getFromKibana(
          userId,
          teamId,
          channelId,
          type
        )
      )
    )
    .then(() =>
      TestFunctions.validateKibanaResults(globalTestConfiguration.bot.api.files.files,type, response1))
    .then(() =>
      globalTestConfiguration.bot.usersInput(
        TestFunctions.getFromKibanaWithAlias(
          userId,
          teamId,
          channelId,
          type,
          alias2
        )
      )
    )
    .then(() =>
      TestFunctions.validateKibanaResults(globalTestConfiguration.bot.api.files.files,type, response2))
    .then(() => {
      done();
    });
}

describe('get from kibana', () => {
  const globalTestConfiguration = new GlobalConfiguration();
  const channelId = globalTestConfiguration.openChannelId;

  it('get dashboards with no account', done => {
    logger.info('get dashboards with no account');
    globalTestConfiguration.bot.usersInput(
      TestFunctions.getFromKibana(
        userId,
        teamId,
        channelId,
        "dashboards"
      )
    )
      .then(message => expect(message.text).toBe(Messages.LOFZ_IO_IS_NOT_CONFIGURED))
      .then(() => done());
  });

  // it('get dashboards', done => {
  //   testGetFromKibana(globalTestConfiguration, channelId, done , "dashboard", [dashbordsResponse1] ,[dashbordsResponse2]);
  // })
  //
  // it('get visualizations', done => {
  //   testGetFromKibana(globalTestConfiguration, channelId, done , "visualization",[visualizationResponse1],[visualizationResponse2]);
  // })
  //
  //  it('get searches', done => {
  //    testGetFromKibana(globalTestConfiguration, channelId, done , "search",[searchResponse1],[searchResponse2]);
  //  })
  //
  // it('get objects', done => {
  //   testGetFromKibana(globalTestConfiguration, channelId, done , "objects",
  //     [dashbordsResponse1,visualizationResponse1,searchResponse1],
  //     [dashbordsResponse2,visualizationResponse2,searchResponse2]);
  // })

  it('get dashboards with not existed alias', done => {
    logger.info('kibana-it-get dashboards with not existed alias');
    globalTestConfiguration.bot.usersInput(
      TestFunctions.getFromKibanaWithAlias(
        userId,
        teamId,
        channelId,
        "dashboards",
        alias1
      )
    )
      .then(message =>
        expect(message.text).toBe(Messages.THERE_IS_NO_ACCOUNT_WITH_THAT_ALIAS))
      .then(() => done());

  });

  // it('create two accounts with alias1-token1, alias2-token2. then get dashboards. then create account with alias1 and token2. get dashboards.', done => {
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
  //         TestFunctions.createOneAccount(
  //           userId,
  //           teamId,
  //           channelId,
  //           'mixed-2-api-token',
  //           'us-east-1',
  //           alias2
  //         )
  //       )
  //     )
  //     .then(message =>
  //       expect(message.text).toBe(
  //         `Okay, you\'re ready to use ${alias2} in Slack!`
  //       )
  //     )
  //     .then(() =>
  //       globalTestConfiguration.bot.usersInput(
  //         TestFunctions.getFromKibanaWithAlias(
  //                     userId,
  //                     teamId,
  //                     channelId,
  //                     "dashboards",
  //                      alias1,
  //                   )
  //       )
  //     )
  //     .then(() => TestFunctions.validateKibanaResults(globalTestConfiguration.bot.api.files.files,'dashboard', [dashbordsResponse1]))
  //     .then(() =>
  //       globalTestConfiguration.bot.usersInput(
  //         TestFunctions.getFromKibanaWithAlias(
  //           userId,
  //           teamId,
  //           channelId,
  //           "dashboards",
  //           alias2,
  //         )
  //       )
  //     )
  //     .then(() => TestFunctions.validateKibanaResults(globalTestConfiguration.bot.api.files.files,'dashboard', [dashbordsResponse2]))
  //     .then(() =>  globalTestConfiguration.bot.usersInput(TestFunctions.removeAccount(userId, teamId, alias2, channelId)))
  //     .then(() => globalTestConfiguration.bot.usersInput(TestFunctions.confirm(userId, teamId, alias2, channelId, 'remove-yes')))
  //     .then(() =>
  //       globalTestConfiguration.bot.usersInput(
  //         TestFunctions.createOneAccount(
  //           userId,
  //           teamId,
  //           channelId,
  //           'mixed-1-api-token',
  //           'us-east-1',
  //           alias2
  //         )
  //       )
  //     )
  //     .then(message =>
  //       expect(message.text).toBe(
  //         `Okay, you\'re ready to use ${alias2} in Slack!`
  //       )
  //     )
  //     .then(() =>
  //       globalTestConfiguration.bot.usersInput(
  //         TestFunctions.getFromKibanaWithAlias(
  //           userId,
  //           teamId,
  //           channelId,
  //           "dashboards",
  //           alias2
  //         )
  //       )
  //     )
  //     .then(() => TestFunctions.validateKibanaResults(globalTestConfiguration.bot.api.files.files,'dashboard', [dashbordsResponse1]))
  //     .then(() => {
  //       done();
  //     });
  // });

  it('get dashboards with no results', done => {
    logger.info('kibana-it-get dashboards with no results');
    globalTestConfiguration.bot
      .usersInput(
        TestFunctions.createOneAccount(
          userId,
          teamId,
          channelId,
          'mixed-3-api-token',
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
          TestFunctions.getFromKibanaWithAlias(
            userId,
            teamId,
            channelId,
            "dashboards",
            alias1
          )
        )
      )
      .then(message =>
        expect(message.text).toBe(`There aren’t any dashboards in that account.`))
      .then(() => {
        done();
      });
  });


  beforeAll(async done => {
    logger.info('kibana-beforeAll-starts');
    var handlers = [
      {
        method: 'post',
        url: '/v1/kibana/export',
        handlerName: 'kibana'
      }
    ];

    const handlersReturnValues = new Object();
    handlersReturnValues['kibana'] = {};
    handlersReturnValues['kibana']['mixed-1-api-token'] = {};
    handlersReturnValues['kibana']['mixed-2-api-token'] = {};
    handlersReturnValues['kibana']['mixed-3-api-token'] = {};

    handlersReturnValues['kibana']['mixed-1-api-token']['dashboard'] = dashbordsResponse1;
    handlersReturnValues['kibana']['mixed-2-api-token']['dashboard'] = dashbordsResponse2;
    handlersReturnValues['kibana']['mixed-3-api-token']['dashboard'] = dashbordsResponseNoResults;


    handlersReturnValues['kibana']['mixed-1-api-token']['visualization'] = visualizationResponse1;
    handlersReturnValues['kibana']['mixed-2-api-token']['visualization'] = visualizationResponse2;

    handlersReturnValues['kibana']['mixed-1-api-token']['vis'] = visualizationResponse1;
    handlersReturnValues['kibana']['mixed-2-api-token']['vis'] = visualizationResponse2;

    handlersReturnValues['kibana']['mixed-1-api-token']['search'] = searchResponse1;
    handlersReturnValues['kibana']['mixed-2-api-token']['search'] = searchResponse2;

    await globalTestConfiguration.beforeAll(
      handlers,
      handlersReturnValues,
      true,
      1
    );
    await globalTestConfiguration.mockFirstInstall(
      teamId,
      userId,
      'Logz.io Mixed1',
      undefined,
      'xoxb-357770700357',
      'xoxp-8241711843-408'
    );
    logger.info('kibana-beforeAll-done-1');
    done();
    logger.info('kibana-beforeAll-done-2');
  });

  beforeEach(async (done) => {
    logger.info('kibana-beforeEach-starts');
    const kibanaClient = globalTestConfiguration.createKibanaClientMock([]);
    await globalTestConfiguration.initBeforeEach(kibanaClient, CommandName.SETUP);
    logger.info('kibana-beforeEach-done-1');
    done();
    logger.info('kibana-beforeEach-done-2');
  });

  afterAll(async done => {
    logger.info('kibana-afterAll-starts');
    globalTestConfiguration.afterAll(done);
    logger.info('kibana-afterAll-ends');
  });
  afterEach(async (done) => {
    logger.info('kibana-afterEach-starts');
    globalTestConfiguration.afterEach(done);
    logger.info('kibana-afterEach-ends');
  });

});
