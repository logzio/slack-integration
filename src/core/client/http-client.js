const Axios = require('axios');
const HttpMethod = require('./http-method');
const TeamNotConfiguredError = require('../errors/team-not-configured-error');
const RateLimitExceededError = require('../errors/rate-limit-exceeded-error');

function validateConfiguration(configuration) {
  if (!configuration.getLogzioAccountRegion()) {
    throw new TeamNotConfiguredError('Logz.io account region is not configured!');
  }

  if (!configuration.getLogzioApiToken()) {
    throw new TeamNotConfiguredError('Logz.io api token is not configured!');
  }

  return Promise.resolve(configuration);
}

function getAuthHeaders(token) {
  return {
    json: true,
    headers: {
      'X-USER-TOKEN': token,
      'X-API-TOKEN': token
    }
  };
}

class HttpClient {

  constructor(teamConfigurationService, endpointResolver) {
    this.teamConfigurationService = teamConfigurationService;
    this.endpointResolver = endpointResolver;

    const axiosInstance = Axios.create();
    axiosInstance.defaults.headers.common['User-Agent'] = 'logzio-slack-integration';
    this.axios = axiosInstance
  }

  get(teamId, path) {
    return this.sendRequest(teamId, HttpMethod.GET, path);
  }

  post(teamId, path, body) {
    return this.sendRequest(teamId, HttpMethod.POST, path, body);
  }

  sendRequest(teamId, method, path, body) {
    return this.teamConfigurationService.get(teamId)
      .then(validateConfiguration)
      .then(configuration => {
        const accountRegion = configuration.getLogzioAccountRegion();
        const apiToken = configuration.getLogzioApiToken();

        return this.sendRequestWithRegionAndToken(accountRegion, apiToken, method, path, body)
      });
  }

  sendRequestWithRegionAndToken(accountRegion, apiToken, method, path, body) {
    const endpointUrl = this.endpointResolver.getEndpointUrl(accountRegion, path);
    const authHeaders = getAuthHeaders(apiToken);

    let requestPromise;
    switch (method) {
      case HttpMethod.GET:
        requestPromise = this.axios.get(endpointUrl, authHeaders);
        break;
      case HttpMethod.POST:
        requestPromise = this.axios.post(endpointUrl, body, authHeaders);
        break;
      default:
        return Promise.reject(`Unsupported method ${method}!`);
    }

    return requestPromise
      .then(response => response.data)
      .catch(err => {
        if (err.response.status === 429) {
          throw new RateLimitExceededError(err.response.data.message);
        }
        throw err;
      });
  }

}

module.exports = HttpClient;
