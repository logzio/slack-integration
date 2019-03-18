const GlobalConfiguration = require('../src/core/utils/globalTestConfigurationSetup');
const CommandName = require('./commandName');
const TestFunctions = require('./testFunctions');
const Messages = require('../src/core/messages/messages');
const userId = 'u_mixed1';
const teamId = 't_mixed1';
const alias1 = 'mixed11';
const alias2 = 'mixed22';


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
    globalTestConfiguration.bot.usersInput(
      TestFunctions.getFromKibana(
        userId,
        teamId,
        channelId,
        "dashboards"
      )
    )
      .then(message =>
        expect(message.text).toBe(Messages.LOFZ_IO_IS_NOT_CONFIGURED))
      .then(() => {
        done();
      });
  });

  it('get dashboards', done => {
    testGetFromKibana(globalTestConfiguration, channelId, done , "dashboard", [dashbordsResponse1] ,[dashbordsResponse2]);
  })

  it('get visualizations', done => {
    testGetFromKibana(globalTestConfiguration, channelId, done , "visualization",[visualizationResponse1],[visualizationResponse2]);
  })

   it('get searches', done => {
     testGetFromKibana(globalTestConfiguration, channelId, done , "search",[searchResponse1],[searchResponse2]);
   })

  it('get objects', done => {
    testGetFromKibana(globalTestConfiguration, channelId, done , "objects",
      [dashbordsResponse1,visualizationResponse1,searchResponse1],
      [dashbordsResponse2,visualizationResponse2,searchResponse2]);
  })

  it('get dashboards with not existed alias', done => {
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
      .then(() => {
        done();
      });

  });

  it('create two accounts with alias1-token1, alias2-token2. then get dashboards. then create account with alias1 and token2. get dashboards.', done => {
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
          TestFunctions.getFromKibanaWithAlias(
                      userId,
                      teamId,
                      channelId,
                      "dashboards",
                       alias1,
                    )
        )
      )
      .then(() => TestFunctions.validateKibanaResults(globalTestConfiguration.bot.api.files.files,'dashboard', [dashbordsResponse1]))
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.getFromKibanaWithAlias(
            userId,
            teamId,
            channelId,
            "dashboards",
            alias2,
          )
        )
      )
      .then(() => TestFunctions.validateKibanaResults(globalTestConfiguration.bot.api.files.files,'dashboard', [dashbordsResponse2]))
      .then(() =>  globalTestConfiguration.bot.usersInput(
       TestFunctions.removeAccount(userId, teamId, alias1, channelId)
      ))
      .then(() => {
        globalTestConfiguration.bot
          .usersInput(
            TestFunctions.confirm(userId, teamId, alias1, channelId, 'remove-yes')
          )
      })
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.createOneAccount(
            userId,
            teamId,
            channelId,
            'mixed-2-api-token',
            'us-east-1',
            alias1
          )
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
      .then(() => TestFunctions.validateKibanaResults(globalTestConfiguration.bot.api.files.files,'dashboard', [dashbordsResponse2]))
      .then(() => {
        done();
      });
  });

  it('get dashboards with no results', done => {
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
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;
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
