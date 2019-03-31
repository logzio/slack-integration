const GlobalConfiguration = require('../src/core/utils/globalTestConfigurationSetup');
const CommandName = require('./commandName');
const TestFunctions = require('./testFunctions');
const userId = 'u_mixed1';
const teamId = 't_mixed1';
const alias1 = 'mixed1';
const alias2 = 'mixed2';

const searchResults1 = [
  {
    _index: 'logz-uxidm1',
    _type: 'search-test-result',
    _id: 'uxidm1-AWkGNYgAtdattC3fpiJz'
  },
  {
    _index: 'logz-uxidm2',
    _type: 'search-test-result',
    _id: 'uxidm2-AWkGNYgAtdattC3fpiJ0'
  }
];

const searchResults2 = [
  {
    _index: 'logz-uxidm2',
    _type: 'search-test-result2',
    _id: 'uxidm1-AWkGNYgAtdattC3fpiJz2'
  },
  {
    _index: 'logz-uxidm2',
    _type: 'search-test-result2',
    _id: 'uxidm2-AWkGNYgAtdattC3fpiJ02'
  }
];

describe('search', () => {
  const globalTestConfiguration = new GlobalConfiguration();
  const channelId = globalTestConfiguration.openChannelId;
  const total = 2;

  const validateSearchResult = searchResults => {
    const content = JSON.parse(
      globalTestConfiguration.bot.api.files.files.content
    );
    expect(content.message).toBe(`ok`);
    expect(content.total).toBe(total);
    expect(content.hits[0]._id).toBe(searchResults[0]._id);
  };

  it('search - test valid commands', done => {
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
          TestFunctions.search(
            userId,
            teamId,
            channelId,
            'error',
            'last 3 minutes'
          )
        )
      )
      .then(() => validateSearchResult(searchResults1))
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.search(userId, teamId, channelId, 'error', '')
        )
      )
      .then(() => validateSearchResult(searchResults1))
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.search(userId, teamId, channelId, 'error', 'last 3 min')
        )
      )
      .then(() => validateSearchResult(searchResults1))
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.search(userId, teamId, channelId, 'error', 'last 3 m')
        )
      )
      .then(() => validateSearchResult(searchResults1))
      .then(() => globalTestConfiguration.bot.usersInput(
          TestFunctions.search(
            userId,
            teamId,
            channelId,
            'error',
            'last 3 hours'
          )
        )
      )
      .then(() => validateSearchResult(searchResults1))
      .then(() => globalTestConfiguration.bot.usersInput(
          TestFunctions.search(userId, teamId, channelId, 'error', 'last 3 h')
        )
      )
      .then(() => validateSearchResult(searchResults1))
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.search(
            userId,
            teamId,
            channelId,
            'error',
            'from 2019-02-17T13:01:46.000Z to 2019-02-17T13:01:06.057+0000'
          )
        )
      )
      .then(() => validateSearchResult(searchResults1))
      .then(() => done());
  });

  it('search - test valid commands with alias', done => {
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
          TestFunctions.searchWithAlias(
            userId,
            teamId,
            channelId,
            'error',
            'last 3 minutes',
            alias1
          )
        )
      )
      .then(() => validateSearchResult(searchResults1))
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.searchWithAlias(
            userId,
            teamId,
            channelId,
            'error',
            '',
            alias1
          )
        )
      )
      .then(() => validateSearchResult(searchResults1))
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.searchWithAlias(
            userId,
            teamId,
            channelId,
            'error',
            'last 3 min',
            alias1
          )
        )
      )
      .then(() => validateSearchResult(searchResults1))
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.searchWithAlias(
            userId,
            teamId,
            channelId,
            'error',
            'last 3 m',
            alias1
          )
        )
      )
      .then(() => validateSearchResult(searchResults1))
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.searchWithAlias(
            userId,
            teamId,
            channelId,
            'error',
            'last 3 hours',
            alias1
          )
        )
      )
      .then(() => validateSearchResult(searchResults1))
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.searchWithAlias(
            userId,
            teamId,
            channelId,
            'error',
            'last 3 h',
            alias1
          )
        )
      )
      .then(() => validateSearchResult(searchResults1))
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.searchWithAlias(
            userId,
            teamId,
            channelId,
            'error',
            'from 2019-02-17T13:01:46.000Z to 2019-02-17T13:01:06.057+0000',
            alias1
          )
        )
      )
      .then(() => validateSearchResult(searchResults1))
      .then(() => done()
      );
  });

  it('search - test valid commands', done => {
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
          TestFunctions.searchWithAlias(
            userId,
            teamId,
            channelId,
            'error',
            'last 3 minutes',
            alias1
          )
        )
      )
      .then(() => validateSearchResult(searchResults1))

      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.searchWithAlias(
            userId,
            teamId,
            channelId,
            'error',
            'last 3 minutes',
            alias2
          )
        )
      )
      .then(() => validateSearchResult(searchResults2))
      .then(() => done());
  });

  beforeAll(async (done) => {
    const searchReturnValue1 = {
      statusCode: 200,
      body: {
        message: 'ok',
        total: total,
        hits: searchResults1
      }
    };

    const searchReturnValue2 = {
      statusCode: 200,
      body: {
        message: 'ok',
        total: total,
        hits: searchResults2
      }
    };

    var handlers = [
      {
        method: 'post',
        url: '/v1/search',
        handlerName: 'search'
      }
    ];
    const handlersReturnValues = new Object();
    handlersReturnValues['search'] = {};
    handlersReturnValues['search']['mixed-1-api-token'] = searchReturnValue1;
    handlersReturnValues['search']['mixed-2-api-token'] = searchReturnValue2;

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
      'xoxp-8241711843-408'
    );
    done()
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
