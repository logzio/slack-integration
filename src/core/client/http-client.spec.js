const EndpointResolver = require('./endpoint-resolver');
const findFreePort = require("find-free-port");
const HttpClient = require('./http-client');
const JasmineHttpServerSpy = require('jasmine-http-server-spy');
const TeamConfiguration = require('../configuration/team-configuration');

describe('HttpClient', () => {

  const configuredTeamId = 'configured-team';
  const configuredTeamToken = 'configured-team-token';
  const teamIdWithOnlyRegionConfigured = 'team-with-only-region';

  it('should include account api token with each request', done => {
    const test = (httpMethodName, mockServerMethodName) => {
      return this.httpClient[httpMethodName](configuredTeamId, '/mocked-url')
        .then(() => {
          expect(this.httpSpy[mockServerMethodName]).toHaveBeenCalledWith(jasmine.objectContaining({
            headers: jasmine.objectContaining({
              'x-api-token': configuredTeamToken,
              'x-user-token': configuredTeamToken,
            })
          }));

          return Promise.resolve();
        })
        .catch(err => {
          console.error(`Failed to test ${httpMethodName.toUpperCase()} method`, err);
          return Promise.reject(err);
        });
    };
    test('get', 'getMockedUrl')
      .then(() => test('post', 'postMockedUrl'))
      .then(done)
      .catch(done.fail);
  });

  it('should throw exception when the region is not configured', done => {
    const unconfiguredTeam = 'unconfigured_team';
    this.httpClient.get(unconfiguredTeam, '/whoami')
      .then(() => done.fail('Promise should not be resolved!'))
      .catch(err => {
        expect(err.message).toBe('Logz.io account region is not configured!');
        done();
      });
  });

  it('should throw exception when the api token is not configured', done => {
    this.httpClient.get(teamIdWithOnlyRegionConfigured, '/whoami')
      .then(() => done.fail('Promise should not be resolved!'))
      .catch(err => {
        expect(err.message).toBe('Logz.io api token is not configured!');
        done();
      });
  });

  beforeAll(done => {
    findFreePort(3000, (err, freePort) => {
      this.port = freePort;
      this.httpSpy = JasmineHttpServerSpy.createSpyObj('mockServer', [{
        method: 'get',
        url: '/mocked-url',
        handlerName: 'getMockedUrl'
      }, {
        method: 'post',
        url: '/mocked-url',
        handlerName: 'postMockedUrl'
      }]);

      this.httpSpy.server.start(this.port, () => {
        const response = {
          statusCode: 200,
          body: {
            message: 'ok'
          }
        };

        this.httpSpy.getMockedUrl.and.returnValue(response);
        this.httpSpy.postMockedUrl.and.returnValue(response);

        createMockClasses();
        done();
      });
    });
  });

  afterAll(done => {
    this.httpSpy.server.stop(done)
  });

  afterEach(() => {
    this.httpSpy.getMockedUrl.calls.reset();
    this.httpSpy.postMockedUrl.calls.reset();
  });

  const createMockClasses = () => {
    const config = {
      regions: {
        'us-east-1': {
          endpoint: `http://localhost:${this.port}`
        }
      }
    };

    const get = (id) => {
      const teamConfiguration = new TeamConfiguration();

      switch (id) {
        case configuredTeamId:
          teamConfiguration
            .setLogzioAccountRegion('us-east-1')
            .setLogzioApiToken(configuredTeamToken);
          break;
        case teamIdWithOnlyRegionConfigured:
          teamConfiguration
            .setLogzioAccountRegion('us-east-1');
          break;
      }

      return Promise.resolve(teamConfiguration);
    };

    this.endpointResolver = new EndpointResolver(config);
    this.httpClient = new HttpClient({ get }, this.endpointResolver);
  }

});
