const GlobalTestConfigurationSetup = require('../src/core/utils/globalTestConfigurationSetup');
const TestFunctions = require('./testFunctions');
const CommandName = require('./commandName');
const Messages = require('../src/core/messages/messages');
const userId = 'r_user';
const teamId = 'rm_t';
const alias1 = 'alias_remove1';
const alias2 = 'alias_remove2';
const someChannelId = 'someChannelId';

describe('Remove account command', () => {
  const globalTestConfigurationSetup = new GlobalTestConfigurationSetup();
  const channelId = globalTestConfigurationSetup.openChannelId;

  it('add two accounts and remove the second on', done => {
    globalTestConfigurationSetup.bot
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
        globalTestConfigurationSetup.bot.usersInput(
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
        globalTestConfigurationSetup.bot.usersInput(
          TestFunctions.getAccounts(userId, teamId, channelId)
        )
      )
      .then(message => {
        expect(message.channel).toBe(channelId);
        expect(message.text).toBe(
          `These are the accounts in this workspace:\n` +
            `• \`${alias1}\`: Slack alias for Logzio App Test 1 Prod. *This is the default workspace account.*\n` +
            `• \`${alias2}\`: Slack alias for Logzio App Test 2 Prod.\n`
        );
      })

      .then(() =>
        globalTestConfigurationSetup.bot.usersInput(
          TestFunctions.removeAccount(userId, teamId, alias2, channelId)
        )
      )
      .then(message => {
        expect(message.attachments[0].text).toBe(
          `Are you sure you want to remove ${alias2}?`
        );
      })
      .then(() => {
        globalTestConfigurationSetup.bot
          .usersInput(
            TestFunctions.confirm(userId, teamId, alias2, channelId, 'remove-yes')
          )
          .then(message => {
            expect(message.text).toBe(`Okay, I removed ${alias2} from Slack.`);
            globalTestConfigurationSetup.bot
              .usersInput(TestFunctions.getAccounts(userId, teamId, channelId))
              .then(message => {
                expect(message.channel).toBe(channelId);
                expect(message.text).toBe(
                  `These are the accounts in this workspace:\n` +
                    `• \`${alias1}\`: Slack alias for Logzio App Test 1 Prod. *This is the default workspace account.*\n`
                );
                done();
              });
          });
      });
  });

  it('remove account => confirm no', done => {
    globalTestConfigurationSetup.bot
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
        globalTestConfigurationSetup.bot.usersInput(
          TestFunctions.removeAccount(userId, teamId, alias1, channelId)
        )
      )
      .then(message => {
        expect(message.attachments[0].text).toBe(Messages.YOU_ARE_ABOUT_TO_REMOVE_LAST_ACCOUNT);
      })
      .then(() => {
        globalTestConfigurationSetup.bot
          .usersInput(
            TestFunctions.confirm(userId, teamId, alias2, channelId, 'remove-no')
          )
          .then(message => {
            expect(message.text).toBe(Messages.I_WONT_REMOVE_ACCOUNT);
            globalTestConfigurationSetup.bot
              .usersInput(TestFunctions.getAccounts(userId, teamId, channelId))
              .then(message => {
                expect(message.channel).toBe(channelId);
                expect(message.text).toBe(
                  `These are the accounts in this workspace:\n` +
                    `• \`${alias1}\`: Slack alias for Logzio App Test 1 Prod. *This is the default workspace account.*\n`
                );
                done();
              });
          });
      });
  });

  it('add account and then try to remove not existed alias', done => {
    globalTestConfigurationSetup.bot
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
        globalTestConfigurationSetup.bot.usersInput(
          TestFunctions.removeAccount(userId, teamId, alias2, channelId)
        )
      )
      .then(message => {
        expect(message.text).toBe(Messages.THERE_IS_NO_ACCOUNT_WITH_THAT_ALIAS);
        done();
      });
  });

  it('remove not existed alias when no api token configured', done => {
    globalTestConfigurationSetup.bot
      .usersInput(
        TestFunctions.removeAccount(userId, teamId, alias2, channelId)
      )
      .then(message => {
        expect(message.text).toBe(Messages.THERE_IS_NO_ACCOUNT_WITH_THAT_ALIAS);
        done();
      });
  });

  it('remove without alias where there is not accounts configured yet', done => {
    globalTestConfigurationSetup.bot
      .usersInput(
        TestFunctions.removeAccountWithoutAlias(userId, teamId, channelId)
      )
      .then(message => {
        expect(message.text).toBe(Messages.LOFZ_IO_IS_NOT_CONFIGURED);
        done();
      });
  });

  it('add two accounts. set the second to a channel and then try to remove it', done => {
    globalTestConfigurationSetup.bot
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
        globalTestConfigurationSetup.bot.usersInput(
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
        globalTestConfigurationSetup.bot.usersInput(
          TestFunctions.setChannelAccount(userId, teamId, channelId, alias2)
        )
      )
      .then(message =>
        expect(message.text).toBe(
          `Okay, '${alias2}' is the channel account now.`
        )
      )
      .then(() =>
        globalTestConfigurationSetup.bot.usersInput(
          TestFunctions.getAccounts(userId, teamId, channelId)
        )
      )
      .then(message => {
        expect(message.channel).toBe(channelId);
        expect(message.text).toBe(
          `These are the accounts in this workspace:\n` +
            `• \`${alias1}\`: Slack alias for Logzio App Test 1 Prod. *This is the default workspace account.*\n` +
            `• \`${alias2}\`: Slack alias for Logzio App Test 2 Prod. This is the channel account for <#openc1|someChannelId_name>.\n`
        );
      })
      .then(() =>
        globalTestConfigurationSetup.bot.usersInput(
          TestFunctions.removeAccount(userId, teamId, alias2, channelId)
        )
      )
      .then(message => {
        expect(message.attachments[0].text).toBe(
          `${alias2} is used in these channels: <#${channelId}|${someChannelId}_name>. Are you sure you want to remove it from Slack?`
        );
      })
      .then(() => {
        globalTestConfigurationSetup.bot
          .usersInput(
            TestFunctions.confirm(userId, teamId, alias2, channelId, 'remove-yes')
          )
          .then(message => {
            expect(message.text).toBe(`Okay, I removed ${alias2} from Slack.`);
            globalTestConfigurationSetup.bot
              .usersInput(TestFunctions.getAccounts(userId, teamId, channelId))
              .then(message => {
                expect(message.text).toBe(
                  `These are the accounts in this workspace:\n` +
                    `• \`${alias1}\`: Slack alias for Logzio App Test 1 Prod. *This is the default workspace account.*\n`
                );
                done();
              });
          });
      });
  });

  it('add account and then try to remove it', done => {
    globalTestConfigurationSetup.bot
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
        globalTestConfigurationSetup.bot.usersInput(
          TestFunctions.removeAccountWithoutAlias(userId, teamId, channelId)
        )
      ) /// remove default?
      .then(message => {
        expect(message.attachments[0].text).toBe(Messages.YOU_ARE_ABOUT_TO_REMOVE_LAST_ACCOUNT);
        done();
      });
  });

  it('add account and then try to remove it without alias. and then try to remove it again.', done => {
    globalTestConfigurationSetup.bot
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
        globalTestConfigurationSetup.bot.usersInput(
          TestFunctions.removeAccountWithoutAlias(userId, teamId, channelId)
        )
      )
      .then(message =>
        expect(message.attachments[0].text).toBe(Messages.YOU_ARE_ABOUT_TO_REMOVE_LAST_ACCOUNT)
      )
      .then(() =>
        globalTestConfigurationSetup.bot.usersInput(
          TestFunctions.confirm(userId, teamId, alias1, channelId, 'remove-yes')
        )
      )
      .then(message =>
        expect(message.text).toBe(Messages.REMOVED_ACCOUNT_MESSAGE)
      )
      .then(() =>
        globalTestConfigurationSetup.bot.usersInput(
          TestFunctions.aliaGetTriggers(userId, teamId, channelId, alias1)
        )
      )
      .then(message =>
        expect(message.text).toBe(Messages.THERE_IS_NO_ACCOUNT_WITH_THAT_ALIAS)
      )
      .then(() =>
        globalTestConfigurationSetup.bot.usersInput(
          TestFunctions.removeAccountWithoutAlias(userId, teamId, channelId)
        )
      )
      .then(message =>
        expect(message.text).toBe(Messages.LOFZ_IO_IS_NOT_CONFIGURED)
      )
      .then(() => done());
  });

  it('add two accounts. set the second to a channel and then try to remove it without an alias', done => {
    globalTestConfigurationSetup.bot
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
        globalTestConfigurationSetup.bot.usersInput(
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
        globalTestConfigurationSetup.bot.usersInput(
          TestFunctions.setChannelAccount(userId, teamId, channelId, alias2)
        )
      )
      .then(message =>
        expect(message.text).toBe(
          `Okay, '${alias2}' is the channel account now.`
        )
      )

      .then(() =>
        globalTestConfigurationSetup.bot.usersInput(
          TestFunctions.removeAccountWithoutAlias(userId, teamId, channelId)
        )
      )
      .then(message =>
        expect(message.attachments[0].text).toBe(
          `${alias2} is used in these channels: <#${channelId}|${someChannelId}_name>. Are you sure you want to remove it from Slack?`
        )
      )
      .then(() =>
        globalTestConfigurationSetup.bot.usersInput(
          TestFunctions.confirm(userId, teamId, alias1, channelId, 'remove-yes')
        )
      )
      .then(() => done());
  });

  beforeAll(async done => {
    var handlers = [];
    var handlersReturnValues = new Object();
    await globalTestConfigurationSetup.beforeAll(
      handlers,
      handlersReturnValues,
      true
    );
    done();
  });

  beforeEach(async (done) => {
    await globalTestConfigurationSetup.mockFirstInstall(
      teamId,
      userId,
      'Logz.io Add account test',
      'us-east-1',
      'xoxb-357770700357',
      'xoxp-8241711843-408'
    );

    const kibanaClient = globalTestConfigurationSetup.createKibanaClientMock(
      []
    );
    await globalTestConfigurationSetup.initBeforeEach(
      kibanaClient,
      CommandName.SETUP
    );
    done();
  });

  afterAll(done => {
    globalTestConfigurationSetup.afterAll(done);
  });
  afterEach((done) => {
    globalTestConfigurationSetup.afterEach(done);
  });
});
