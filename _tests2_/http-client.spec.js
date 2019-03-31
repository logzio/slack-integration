const RateLimitExceededError = require('../src/core/errors/rate-limit-exceeded-error');
const AliasNotExistError = require('../src/core/errors/alias-not-exist-error');
const GlobalConfiguration = require('../src/core/utils/globalTestConfigurationSetup');

describe('HttpClient', () => {
  const configuredTeamId = 'team1';
  const configuredTeamToken = 'apitoken';
  const teamIdWithOnlyRegionConfigured = 'teamx';
  const globalTestConfiguration = new GlobalConfiguration();
  const chanelId = 'chanelId';

  it('should include account api token and user-agent with each request', done => {
    const test = (httpMethodName, mockServerMethodName) => {
      return globalTestConfiguration.httpClient[httpMethodName](
        chanelId,
        configuredTeamId,
        '/mocked-url'
      )
        .then(() => {
          expect(
            globalTestConfiguration.httpSpy[mockServerMethodName]
          ).toHaveBeenCalledWith(
            jasmine.objectContaining({
              headers: jasmine.objectContaining({
                'user-agent': 'logzio-slack-integration',
                'x-api-token': configuredTeamToken,
                'x-user-token': configuredTeamToken
              })
            })
          );

          return Promise.resolve();
        })
        .catch(err => {
          console.error(
            `Failed to test ${httpMethodName.toUpperCase()} method`,
            err
          );
          return Promise.reject(err);
        });
    };
    test('get', 'getMockedUrl')
      .then(() => test('post', 'postMockedUrl'))
      .then(done)
      .catch(done.fail);
  });

  it('wrong alias post', done => {
    globalTestConfiguration.httpClient
      .post(chanelId, configuredTeamId, '/mocked-url', {}, 'wrong_alias')
      .then(done.fail)
      .catch(err => {
        expect(err.constructor).toBe(AliasNotExistError);
        expect(err.message).toBe(
          "Sorry, there isn't an account with that alias. If you want to see your accounts, type `@Alice accounts`."
        );
        done();
      });
  });

  it('rate limit propagation to the user', done => {
    globalTestConfiguration.httpClient
      .post(chanelId, configuredTeamId, '/mocked-rate-limit-url', {})
      .then(done.fail)
      .catch(err => {
        expect(err.constructor).toBe(RateLimitExceededError);
        expect(err.message).toBe('rate limit not ok');
        done();
      });
  });

  it('should throw exception when the region is not configured', done => {
    const unconfiguredTeam = 'unconfigured_team';
    globalTestConfiguration.httpClient
      .get(chanelId, unconfiguredTeam, '/whoami')
      .then(() => done.fail('Promise should not be resolved!'))
      .catch(err => {
        expect(err.message).toBe('Logz.io account region is not configured!');
        done();
      });
  });

  it('should throw exception when the api token is not configured', done => {
    globalTestConfiguration.httpClient
      .get(chanelId, teamIdWithOnlyRegionConfigured, '/whoami')
      .then(() => done.fail('Promise should not be resolved!'))
      .catch(err => {
        expect(err.message).toBe('Logz.io api token is not configured!');
        done();
      });
  });

  beforeAll(async done => {
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

    await globalTestConfiguration.beforeAll(
      [
        {
          method: 'get',
          url: '/mocked-url',
          handlerName: 'getMockedUrl'
        },
        {
          method: 'post',
          url: '/mocked-url',
          handlerName: 'postMockedUrl'
        },
        {
          method: 'post',
          url: '/mocked-rate-limit-url',
          handlerName: 'mockedRateLimitUrl'
        }
      ],
      [response, response, rateLimitResponse]
    );

    await globalTestConfiguration.mockFirstInstall(
      configuredTeamId,
      'userId',
      'Logz.io http client 1',
      'us-east-1',
      'xoxb-357770700358',
      'xoxp-8241711843-4088',
      configuredTeamToken
    );
    await globalTestConfiguration.mockFirstInstall(
      teamIdWithOnlyRegionConfigured,
      'userId2',
      'Logz.io http client 2',
      'us-east-1',
      'xoxb-357770700359',
      'xoxp-8241711843-4089'
    );

    done();
  });

  afterAll(done => {
    globalTestConfiguration.afterAll(done);
  });
  afterEach((done) => {
    globalTestConfiguration.afterEach(done);
  });
  beforeEach(async (done) => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000000;
    const kibanaClient = globalTestConfiguration.createKibanaClientMock([]);
    await globalTestConfiguration.initBeforeEach(kibanaClient);
    done();
  });
});
