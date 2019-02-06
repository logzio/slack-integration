const moment = require('moment');
const userId = 'UserId1';
const GlobalConfiguration = require('../core/utils/globalTestConfiguration');
const CommandName = require('../tests/CommandName');

describe('Mixed1',() => {
  const teamId = 'teamId66';
  const objectType = 'dashboard';
  const objectName = 'test-dashboard';
  const query = '"type:kube-apiserver"';
  const channelId = 'someChannelId';
  const userCommand = `snapshot ${objectType} ${objectName} last 1h query ${query}`;
  const userInputs = [{
    user: userId,
    channel: channelId,
    messages: [{
      team: teamId,
      text: userCommand, isAssertion: true
    }]
  }];
  const globalTestConfiguration = new GlobalConfiguration();


  it('Configure your Logz.io integration with Slack', (done) => {
    let sequence = [
      {
        user: userId,
        channel: channelId,
        messages: [
          { team: { id: teamId}, text: 'add account'},
         // { team: { id: teamId}, text: 'Yes', isAssertion: true}
        ]
      }
    ];
    globalTestConfiguration.bot.usersInput(sequence)
      .then((message) => {
        expect(message.attachments[0].title).toBe('Configure your Logz.io integration with Slack');
       // expect(message.attachments[0].text).toBe('Do you want to connect your Logz.io account?');
        done();
      });



  });




  beforeAll(async (done) => {
    await globalTestConfiguration.beforeAll([{
      method: 'post',
      url: '/v1/snapshotter',
      handlerName: 'snapshots'
    }],
      [{
        statusCode: 200,
        body: {
          message: 'ok'
        }}
        ])

  //  await globalTestConfiguration.mockFirstInstall('teamId2','us-east-1','token2');
    done()
  });

  beforeEach(async () => {
    const kibanaClient = globalTestConfiguration.createKibanaClientMock([]);
    await globalTestConfiguration.initBeforeEach(kibanaClient, CommandName.SETUP);
  });

  afterAll(done => { globalTestConfiguration.afterAll(done);});
  afterEach(() => {globalTestConfiguration.afterEach();});

});
