const GlobalConfiguration = require('../src/core/utils/globalTestConfigurationSetup');
const CommandName = require('./commandName');
const TestFunctions = require('./testFunctions');
const Messages = require('../src/core/messages/messages');
const userId = 'u_mixed2';
const teamId = 't_'+Math.random().toString(36).substr(2, 3);
const channelId2 = 'chan2';
const alias1 = 'x1'+Math.random().toString(36).substr(2, 7);
const alias2 = 'x2'+Math.random().toString(36).substr(2, 7);



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
          TestFunctions.getAccounts(userId, teamId, channelId)
        )
      )
      .then(message => {
        expect(message.channel).toBe(channelId);
        expect(message.text).toBe(
          `These are the accounts in this workspace:\n• \`${alias1}\`: Slack alias for Logzio App Test 1 Prod. *This is the default workspace account.*\n• \`${alias2}\`: Slack alias for Logzio App Test 2 Prod.\n`
        );
      })

      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.getChannelAccount(userId, teamId, channelId2)
        )
      )
      .then(message => {
        expect(message.text).toBe(Messages.NO_CHANNEL_ACCOUNT);
      })
      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.setChannelAccount(userId, teamId, channelId2, alias2)
        )
      )
      .then(message => {
        expect(message.text).toBe(
          `Okay, '${alias2}' is the channel account now.`
        );
      })
      .then(() =>
        globalTestConfiguration.bot.usersInput(TestFunctions.getChannelAccount(userId, teamId, channelId2))
      )
      .then(message => {
        expect(message.text).toBe(Messages.getCurrentChannel(alias2));
      })

      .then(() =>
        globalTestConfiguration.bot.usersInput(
          TestFunctions.removeAccount(userId, teamId, alias2, channelId)
        )
      )
      .then(() => {
        globalTestConfiguration.bot
          .usersInput(
            TestFunctions.confirm(userId, teamId, alias2, channelId, 'remove-yes')
          )
          .then(message => {
            expect(message.text).toBe(`Okay, I removed ${alias2} from Slack.`);
            globalTestConfiguration.bot.usersInput(TestFunctions.getChannelAccount(userId, teamId, channelId2))
              .then(message => {
                expect(message.text).toBe(Messages.NO_CHANNEL_ACCOUNT);
                done();
              });
          });
      });
  });

  beforeAll(async done => {

    var handlers = [];
    const handlersReturnValues = new Object();

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
