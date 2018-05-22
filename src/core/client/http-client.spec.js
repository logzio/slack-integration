const EndpointResolver = require('./endpoint-resolver');
const findFreePort = require("find-free-port");
const HttpClient = require('./http-client');
const JasmineHttpServerSpy = require('jasmine-http-server-spy');
const TeamConfiguration = require('../configuration/team-configuration');
const RateLimitExceededError = require('../errors/rate-limit-exceeded-error');

describe('HttpClient', () => {

  const configuredTeamId = 'configured-team';
  const configuredTeamToken = 'configured-team-token';
  const teamIdWithOnlyRegionConfigured = 'team-with-only-region';

  it('should include account api token and user-agent with each request', done => {
    const test = (httpMethodName, mockServerMethodName) => {
      return this.httpClient[httpMethodName](configuredTeamId, '/mocked-url')
        .then(() => {
          expect(this.httpSpy[mockServerMethodName]).toHaveBeenCalledWith(jasmine.objectContaining({
            headers: jasmine.objectContaining({
              'user-agent': 'logzio-slack-integration',
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

  it('rate limit propagation to the user', done => {
    this.httpClient.post(configuredTeamId, '/mocked-rate-limit-url', {})
      .then(done.fail)
      .catch(err => {
        expect(err.constructor).toBe(RateLimitExceededError);
        expect(err.message).toBe('rate limit not ok');
        done();
    })
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
      }, {
        method: 'post',
        url: '/mocked-rate-limit-url',
        handlerName: 'mockedRateLimitUrl'
      }]);

      this.httpSpy.server.start(this.port, () => {
        const response = {
          statusCode: 200,
          body: {
            message: 'ok'
          }
        };

        const rateLimitResponse = {
          statusCode: 429,
          body: {
            message: 'rate limit not ok'
          }
        };

        this.httpSpy.getMockedUrl.and.returnValue(response);
        this.httpSpy.postMockedUrl.and.returnValue(response);
        this.httpSpy.mockedRateLimitUrl.and.returnValue(rateLimitResponse);

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
    this.httpSpy.mockedRateLimitUrl.calls.reset();
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
