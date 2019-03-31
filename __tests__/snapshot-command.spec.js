const moment = require('moment');
const Messages = require('../src/core/messages/messages');
const userId = 'UserId1';
const GlobalConfiguration = require('../src/core/utils/globalTestConfigurationSetup');
const LoggerFactory = require('../src/core/logging/logger-factory');
const CommandName = require('./commandName');
const teamId = 'teamId66';
const objectType = 'dashboard';
const objectName = 'test-dashboard';
const query = '"type:kube-apiserver"';
const channelId = 'someChannelId';
const userCommand = `snapshot ${objectType} ${objectName} last 1h query ${query}`;
const userInputs = [
  {
    user: userId,
    channel: channelId,
    messages: [
      {
        team: teamId,
        text: userCommand,
        isAssertion: true
      }
    ]
  }
];
describe('SnapshotCommand', () => {

  const globalTestConfiguration = new GlobalConfiguration();
  it('should send snapshot request', done => {
    globalTestConfiguration.bot
      .usersInput(userInputs)
      .then(message => {
        expect(message.text).toBe(Messages.getResults('my-account')+'Snapshot request has been sent.');
        expect(globalTestConfiguration.httpSpy.snapshots).toHaveBeenCalledWith(
          jasmine.objectContaining({
            body: jasmine.objectContaining({
              snapshotType: objectType.toUpperCase(),
              snapshotSavedObjectId: kibanaObjectId,
              message: jasmine.stringMatching(`.*${query}`),
              queryString: query,
              darkTheme: true,
              snapshotTimeZone: 'UTC',
              slackWebhookUrls: [
                `${
                  globalTestConfiguration.externalDomain
                  }/webhook/${teamId}/${channelId}`
              ]
            })
          })
        );

        const requestBody = globalTestConfiguration.httpSpy.snapshots.calls.first()
          .args[0].body;
        const timeFrameFrom = requestBody.timeFrameFrom;
        const timeFrameTo = requestBody.timeFrameTo;
        const duration = moment.duration(
          moment(timeFrameTo).diff(moment(timeFrameFrom))
        );
        expect(duration.asSeconds()).toBe(60 * 60);
      })
      .then(()=> done());
  });

  it('undefined user', done => {
    globalTestConfiguration
      .initBeforeEach(
        globalTestConfiguration.createKibanaClientMock(undefined),
        CommandName.SNAPSHOT
      )
      .then(() =>
        globalTestConfiguration.bot.usersInput(userInputs).then(message =>
          expect(message.text).toBe('Failed to send snapshot request'))
      )
      .then(()=>done());
  });

  it('should message an error when there is no snapshot with specified name', done => {
    const userInputs = [
      {
        user: userId,
        channel: channelId,
        messages: [
          {
            team: teamId,
            text: `snapshot ${objectType} 'bad-object-name' last 1h query ${query}`,
            isAssertion: true
          }
        ]
      }
    ];
    globalTestConfiguration.bot.usersInput(userInputs)
      .then(message =>
        expect(message.text).toBe(
          `Unable to find ${objectType} with the specified name`))
      .then(() => done());
  });

  const kibanaObjectId = 'test-dashboard-id';
  const kibanaObjectId2 = 'test-dashboard2-id-2';

  it('there are multiple results with the specified name', done => {

    const matchedKibanaObjects = [
      { _id: kibanaObjectId, _source: { title: objectName }},
      { _id: kibanaObjectId2, _source: { title: objectName }}
    ];
    matchedKibanaObjects.alias = 'my-account';
    const kibanaClient = globalTestConfiguration.createKibanaClientMock(matchedKibanaObjects);

    globalTestConfiguration
      .initBeforeEach(kibanaClient, CommandName.SNAPSHOT)
      .then(() =>
        globalTestConfiguration.bot.usersInput(userInputs).then(message =>
          expect(message.text).toBe( Messages.getResults('my-account') +
            `There's more than one ${objectType} with that name or ID. Please refine your request.`
          )
        ))
      .then(()=>done())

    ;
  });

  // it('there are multiple results with the specified name - when more then one id name contain objectName - wrong?', done => {
  //   const matchedKibanaObjects = [
  //     { _id: kibanaObjectId, _source: { title: objectName } },
  //     { _id: kibanaObjectId2, _source: { title: 'test-dashboard2' } }
  //   ];
  //   matchedKibanaObjects.alias = 'my-account';
  //   const kibanaClient = globalTestConfiguration.createKibanaClientMock(matchedKibanaObjects);
  //   globalTestConfiguration
  //     .initBeforeEach(kibanaClient, CommandName.SNAPSHOT)
  //     .then(() => {
  //       globalTestConfiguration.bot.usersInput(userInputs).then(message => {
  //         expect(message.text).toBe(Messages.getResults('my-account') +
  //           `There's more than one ${objectType} with that name or ID. Please refine your request.`
  //         );
  //         done();
  //       });
  //     });
  // });

  // it('there are multiple results with the specified name - when more then one title contain objectName - wrong?', done => {
  //   const matchedKibanaObjects = [{ _id: kibanaObjectId, _source: { title: objectName } },
  //     { _id: 'somename', _source: { title: 'test-dashboard-id-3' } }
  //   ]
  //   matchedKibanaObjects.alias = 'my-account';
  //   const kibanaClient = globalTestConfiguration.createKibanaClientMock(matchedKibanaObjects);
  //   globalTestConfiguration
  //     .initBeforeEach(kibanaClient, CommandName.SNAPSHOT)
  //     .then(() => {
  //       globalTestConfiguration.bot.usersInput(userInputs).then(message => {
  //         expect(message.text).toBe(Messages.getResults('my-account') +
  //           `There's more than one ${objectType} with that name or ID. Please refine your request.`
  //         );
  //         done();
  //       });
  //     });
  // });

  beforeAll(async done => {

    await globalTestConfiguration.beforeAll(
      [
        {
          method: 'post',
          url: '/v1/snapshotter',
          handlerName: 'snapshots'
        }
      ],
      [
        {
          statusCode: 200,
          body: {
            message: 'ok',
          },
          alias:"my-account"
        }
      ]
    );

    await globalTestConfiguration.mockFirstInstall(
      teamId,
      userId,
      'Logz.io Add account test',
      'us-east-1',
      'xoxb-357770700357',
      'xoxp-8241711843-408',
      'token2',
      'my-account'
    );

    done();
  });

  beforeEach(async (done) => {
    const kibanaClient = globalTestConfiguration.createKibanaClientMock([
      {
        _id: kibanaObjectId,
        _source: {
          title: objectName
        },
        alias:'my-account'
      }
    ]);
    await globalTestConfiguration.initBeforeEach(
      kibanaClient,
      CommandName.SNAPSHOT
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
