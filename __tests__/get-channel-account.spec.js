const GlobalConfiguration = require('../src/core/utils/globalTestConfigurationSetup');
const CommandName = require('./commandName');
const TestFunctions = require('./testFunctions');
const Messages = require('../src/core/messages/messages');
const LoggerFactory = require('../src/core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);
const userId = 'u_mixed1';
const teamId = 't_mixed1';
const channelId2 = 'chan2';
const alias1 = 'y1'+Math.random().toString(16).substr(2, 4);
const alias2 = 'y2'+Math.random().toString(16).substr(2, 4);



describe('Get channel account', () => {
  const globalTestConfiguration = new GlobalConfiguration();
  const channelId = globalTestConfiguration.openChannelId;


  it('create two accounts and play with get channel account', done => {
    let sequence = TestFunctions.createOneAccount(
      userId,
      teamId,
      channelId,
      'mixed-1-api-token',
      'us-east-1',
      alias1
    );
    globalTestConfiguration.bot
      .usersInput(sequence)
      .then(message =>
        expect(message.text).toBe(
          `Okay, you\'re ready to use ${alias1} in Slack!`
        )
      )

      .then(() => globalTestConfiguration.bot.usersInput(
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

      .then(() => globalTestConfiguration.bot.usersInput(
          TestFunctions.getAccounts(userId, teamId, channelId)
        )
      )
      .then(message => {
        expect(message.channel).toBe(channelId);
        expect(message.text).toBe(
          `These are the accounts in this workspace:\n• \`${alias1}\`: Slack alias for Logzio App Test 1 Prod. *This is the default workspace account.*\n• \`${alias2}\`: Slack alias for Logzio App Test 2 Prod.\n`
        );
      })
      .then(() => globalTestConfiguration.bot.usersInput(
          TestFunctions.getChannelAccount(userId, teamId, channelId2)
        )
      )
      .then(message => expect(message.text).toBe(Messages.NO_CHANNEL_ACCOUNT))
      .then(() => globalTestConfiguration.bot.usersInput(
          TestFunctions.setChannelAccount(userId, teamId, channelId2, alias2)
        )
      )
      .then(message => expect(message.text).toBe(`Okay, '${alias2}' is the channel account now.`))
      .then(() => globalTestConfiguration.bot.usersInput(TestFunctions.getChannelAccount(userId, teamId, channelId2)))
      .then(message => expect(message.text).toBe(Messages.getCurrentChannel(alias2)))
      .then(() =>done());
  });

  beforeAll(async done => {
    logger.info('get-channel-beforeAll-start');
    var handlers = [];
    const handlersReturnValues = new Object();

    await globalTestConfiguration.beforeAll(
      handlers,
      handlersReturnValues,
      true,
      'get-channel'
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
    logger.info('get-channel-beforeAll-done-1');
    done();
    logger.info('get-channel-beforeAll-done-2');
  });

  beforeEach(async (done) => {
    const kibanaClient = globalTestConfiguration.createKibanaClientMock([]);
    await globalTestConfiguration.initBeforeEach(
      kibanaClient,
      CommandName.SETUP
    );
    done();
  });

  afterAll(async done => {
    logger.info('get-channel-afterAll-start');
    globalTestConfiguration.afterAll(done);
    logger.info('get-channel-afterAll-end');
  });
  afterEach(async (done) => {
    logger.info('get-channel-afterEach-start');
    globalTestConfiguration.afterEach(done);
    logger.info('get-channel-afterEach-end');
  });
});
