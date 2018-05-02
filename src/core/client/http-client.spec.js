const EndpointResolver = require('./endpoint-resolver');
const findFreePort = require("find-free-port");
const HttpClient = require('./http-client');
const JasmineHttpServerSpy = require('jasmine-http-server-spy');
const TeamConfiguration = require('../configuration/team-configuration');

describe('HttpClient', () => {

  let port;
  let httpSpy;

  let endpointResolver;
  let httpClient;

  const configuredTeamId = 'configured-team';
  const configuredTeamToken = 'configured-team-token';
  const teamIdWithOnlyRegionConfigured = 'team-with-only-region';

  it('should include account api token with each request', done => {
    const test = (httpMethodName, mockServerMethodName) => {
      return httpClient[httpMethodName](configuredTeamId, '/mocked-url')
        .then(() => {
          expect(httpSpy[mockServerMethodName]).toHaveBeenCalledWith(jasmine.objectContaining({
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
    httpClient.get(unconfiguredTeam, '/whoami')
      .then(() => done.fail('Promise should not be resolved!'))
      .catch(err => {
        expect(err).toBe('Logz.io account region is not configured!');
        done();
      });
  });

  it('should throw exception when the api token is not configured', done => {
    httpClient.get(teamIdWithOnlyRegionConfigured, '/whoami')
      .then(() => done.fail('Promise should not be resolved!'))
      .catch(err => {
        expect(err).toBe('Logz.io api token is not configured!');
        done();
      });
  });

  beforeAll(done => {
    findFreePort(3000, (err, freePort) => {
      port = freePort;
      httpSpy = JasmineHttpServerSpy.createSpyObj('mockServer', [{
        method: 'get',
        url: '/mocked-url',
        handlerName: 'getMockedUrl'
      }, {
        method: 'post',
        url: '/mocked-url',
        handlerName: 'postMockedUrl'
      }]);

      httpSpy.server.start(port, () => {
        const response = {
          statusCode: 200,
          body: {
            message: 'ok'
          }
        };

        httpSpy.getMockedUrl.and.returnValue(response);
        httpSpy.postMockedUrl.and.returnValue(response);

        createMockClasses();
        done();
      });
    });
  });

  afterAll(done => {
    httpSpy.server.stop(done)

  });

  afterEach(() => {
    httpSpy.getMockedUrl.calls.reset();
    httpSpy.postMockedUrl.calls.reset();
  });

  const createMockClasses = () => {
    const config = {
      regions: {
        'us-east-1': {
          endpoint: `http://localhost:${port}`
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

    endpointResolver = new EndpointResolver(config);
    httpClient = new HttpClient({ get }, endpointResolver);
  }

});
