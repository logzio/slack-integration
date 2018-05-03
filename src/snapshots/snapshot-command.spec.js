const Botmock = require('botkit-mock');
const findFreePort = require("find-free-port");
const HttpClient = require('../core/client/http-client');
const JasmineHttpServerSpy = require('jasmine-http-server-spy');
const moment = require('moment');
const SnapshotCommand = require('./snapshot-command');
const SnapshotsClient = require('./snapshots-client');
const TeamConfiguration = require('../core/configuration/team-configuration');

describe('SnapshotCommand',() => {
  const kibanaObjectId = 'test-dashboard-id';

  it('should send snapshot request', done => {
    const objectType = 'dashboard';
    const objectName = 'test-dashboard';
    const query = '"type:kube-apiserver"';

    const userCommand = `snapshot ${objectType} ${objectName} last 1h query ${query}`;

    const teamId = 'someTeamId';
    const channelId = 'someChannelId';
    const userInputs = [{
      user: 'someUserId',
      channel: channelId,
      messages: [{
        team: teamId,
        text: userCommand, isAssertion: true
      }]
    }];

    this.bot.usersInput(userInputs)
      .then((message) => {
        expect(message.text).toBe('Snapshot request has been sent.');

        expect(this.httpSpy.snapshots).toHaveBeenCalledWith(jasmine.objectContaining({
          body: jasmine.objectContaining({
            snapshotType: objectType.toUpperCase(),
            snapshotSavedObjectId: kibanaObjectId,
            message: jasmine.stringMatching(`.*${query}`),
            queryString: query,
            darkTheme: true,
            snapshotTimeZone: 'UTC',
            slackWebhookUrls: [
              `${this.externalDomain}/webhook/${teamId}/${channelId}`
            ]
          })
        }));

        const requestBody = this.httpSpy.snapshots.calls.first().args[0].body;
        const timeFrameFrom = requestBody.timeFrameFrom;
        const timeFrameTo = requestBody.timeFrameTo;
        const duration = moment.duration(moment(timeFrameTo).diff(moment(timeFrameFrom)));
        expect(duration.asSeconds()).toBe(60 * 60);

        done();
      });
  });

  beforeAll(done => {
    findFreePort(3000, (err, freePort) => {
      this.port = freePort;
      this.externalDomain = `http://localhost:${this.port}`;

      this.httpSpy = JasmineHttpServerSpy.createSpyObj('mockServer', [{
        method: 'post',
        url: '/v1/snapshotter',
        handlerName: 'snapshots'
      }]);

      this.httpSpy.snapshots.and.returnValue({
        statusCode: 200,
        body: {
          message: 'ok'
        }
      });

      this.httpSpy.server.start(this.port, done);
    });
  });

  beforeEach(() => {
    this.controller = Botmock({});
    this.bot = this.controller.spawn({type: 'slack'});

    const externalDomain = this.externalDomain;
    const kibanaClient = createKibanaClientMock();
    const snapshotsClient = createSnapshotClient(externalDomain);

    this.command = new SnapshotCommand(externalDomain, kibanaClient, snapshotsClient);
    this.command.configure(this.controller);
  });

  afterAll(done => {
    this.httpSpy.server.stop(done)
  });

  afterEach(() => {
    this.httpSpy.snapshots.calls.reset();
  });

  function createKibanaClientMock() {
    return {
      listObjects: () => Promise.resolve([{
        _id: kibanaObjectId,
        _source: {
          title: 'test-dashboard'
        }
      }])
    };
  }

  function createSnapshotClient(externalDomain) {
    const get = () => Promise.resolve(new TeamConfiguration()
      .setLogzioAccountRegion('region')
      .setLogzioApiToken('token'));

    const getEndpointUrl = (region, path) => externalDomain + path;

    const httpClient = new HttpClient({ get }, { getEndpointUrl });
    return new SnapshotsClient(httpClient);
  }

});
