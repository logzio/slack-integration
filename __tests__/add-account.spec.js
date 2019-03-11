const GlobalTestConfigurationSetup = require('../src/core/utils/globalTestConfigurationSetup');
const TestFunctions = require('./testFunctions');
const CommandName = require('./commandName');
const Messages = require('../src/core/messages/messages');
const userId = 'u_mixed1';
const teamId = 't_mixed1';

const alias1 = 'mixed1';
const alias2 = 'mixed2';

describe('Add account command', () => {
  const globalTestConfigurationSetup = new GlobalTestConfigurationSetup();
  const channelId = globalTestConfigurationSetup.openChannelId;
  it("Notify user on slack's security when asking to create account", done => {
    let sequence = [
      {
        user: userId,
        channel: channelId,
        messages: [
          {
            text: 'add account',
            isAssertion: true,
            command: 'add account',
            team: { id: teamId }
          }
        ]
      }
    ];
    globalTestConfigurationSetup.bot.usersInput(sequence).then(message => {
      expect(message.attachments[0].title).toBe(
        'Important: You’ll give all users access to Logz.io'
      );
      expect(message.attachments[0].text).toBe(
        'If you add this account, all workspace users can see information on the account, even if they can’t sign in to Logz.io. Do you still want to add the account?'
      );
      done();
    });
  });

  it('Add account => confirm yes', done => {
    let sequence = [
      {
        user: userId,
        channel: channelId,
        messages: [
          { team: { id: teamId }, text: 'add account' },
          { team: { id: teamId }, text: 'Yes', isAssertion: true }
        ]
      }
    ];
    globalTestConfigurationSetup.bot.usersInput(sequence).then(() => {
      const dialog = JSON.parse(
        globalTestConfigurationSetup.bot.api.logByKey['dialog.open'][0].dialog
      );
      expect(dialog.title).toBe('Logz.io Configuration');
      expect(dialog.elements[0].label).toBe('Account region');
      expect(dialog.elements[1].label).toBe('API Token');
      expect(dialog.elements[2].label).toBe('Alias');
      done();
    });
  });

  it('add account => confirm no', done => {
    let sequence = [
      {
        user: userId,
        channel: channelId,
        messages: [
          { team: { id: teamId }, text: 'add account' },
          { team: { id: teamId }, text: 'No', isAssertion: true }
        ]
      }
    ];

    globalTestConfigurationSetup.bot.usersInput(sequence).then(message => {
      expect(message.text).toBe(
        `Okay, I won't add an account now. When you're ready, just type @Alice add account.`
      );
      done();
    });
  });

  it('try to add account with wrong token', done => {
    globalTestConfigurationSetup.bot
      .usersInput(
        TestFunctions.createOneAccount(
          userId,
          teamId,
          channelId,
          'no-such-token',
          'us-east-1',
          alias1
        )
      )
      .then(() => {
        expect(globalTestConfigurationSetup.bot.dialogErrors[0].error).toBe(
          Messages.WRONG_API_TOKEN
        );
        expect(globalTestConfigurationSetup.bot.dialogErrors[0].name).toBe(
          `apiToken`
        );
        done();
      });
  });

  it('try to add account with blank token', done => {
    globalTestConfigurationSetup.bot
      .usersInput(
        TestFunctions.createOneAccount(
          userId,
          teamId,
          channelId,
          '',
          'us-east-1',
          alias1
        )
      )
      .then(() => {
        expect(globalTestConfigurationSetup.bot.dialogErrors[0].error).toBe(
          `API token can't be blank.`
        );
        expect(globalTestConfigurationSetup.bot.dialogErrors[0].name).toBe(
          `apiToken`
        );
        done();
      });
  });

  it('try to add account with blank alias', done => {
    globalTestConfigurationSetup.bot
      .usersInput(
        TestFunctions.createOneAccount(
          userId,
          teamId,
          channelId,
          'mixed-1-api-token',
          'us-east-1',
          ''
        )
      )
      .then(() => {
        expect(globalTestConfigurationSetup.bot.dialogErrors[0].error).toBe(
          `Alias can't be blank`
        );
        expect(globalTestConfigurationSetup.bot.dialogErrors[0].name).toBe(
          `alias`
        );
        done();
      });
  });

  it('try to add account with wrong alias', done => {
    globalTestConfigurationSetup.bot
      .usersInput(
        TestFunctions.createOneAccount(
          userId,
          teamId,
          channelId,
          'mixed-1-api-token',
          'us-east-1',
          'f:'
        )
      )
      .then(() => {
        expect(globalTestConfigurationSetup.bot.dialogErrors[0].error).toBe(
          `This field can contain only letters, numbers, hyphens, and underscores.`
        );
        expect(globalTestConfigurationSetup.bot.dialogErrors[0].name).toBe(
          `alias`
        );
        done();
      });
  });

  it('add two accounts', done => {
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
        done();
      });
  });

  it('add two accounts with same alias and same token', done => {
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
            'mixed-1-api-token',
            'us-east-1',
            alias1
          )
        )
      )
      .then(() => {
        expect(globalTestConfigurationSetup.bot.dialogErrors[0].error).toBe(
          `An account is already using this alias. Try again with a different alias.`
        );
      })
      .then(() =>
        globalTestConfigurationSetup.bot.usersInput(
          TestFunctions.getAccounts(userId, teamId, channelId)
        )
      )
      .then(message => {
        expect(message.channel).toBe(channelId);
        expect(message.text).toBe(
          `These are the accounts in this workspace:\n` +
            `• \`mixed1\`: Slack alias for Logzio App Test 1 Prod. *This is the default workspace account.*\n`
        );
        done();
      });
  });

  it('add two accounts with same alias and different tokens', done => {
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
            alias1
          )
        )
      )
      .then(() => {
        expect(globalTestConfigurationSetup.bot.dialogErrors[0].error).toBe(
          `An account is already using this alias. Try again with a different alias.`
        );
      })
      .then(() =>
        globalTestConfigurationSetup.bot.usersInput(
          TestFunctions.getAccounts(userId, teamId, channelId)
        )
      )
      .then(message => {
        expect(message.channel).toBe(channelId);
        expect(message.text).toBe(
          `These are the accounts in this workspace:\n• \`${alias1}\`: Slack alias for Logzio App Test 1 Prod. *This is the default workspace account.*\n`
        );
        done();
      });
  });

  beforeAll(async done => {
    var handlers = [];
    var handlersReturnValues = new Object();
    await globalTestConfigurationSetup.beforeAll(
      handlers,
      handlersReturnValues,
      true
    );
    await globalTestConfigurationSetup.mockFirstInstall(
      teamId,
      userId,
      'Logz.io Add account test',
      'us-east-1',
      'xoxb-357770700357',
      'xoxp-8241711843-408'
    );
    done();
  });

  beforeEach(async () => {
    const kibanaClient = globalTestConfigurationSetup.createKibanaClientMock(
      []
    );
    await globalTestConfigurationSetup.initBeforeEach(
      kibanaClient,
      CommandName.SETUP
    );
  });

  afterAll(done => {
    globalTestConfigurationSetup.afterAll(done);
  });
  afterEach(() => {
    globalTestConfigurationSetup.afterEach();
  });
});
