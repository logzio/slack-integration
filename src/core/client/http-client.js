const Axios = require('axios');
const HttpMethod = require('./http-method');
const TeamNotConfiguredError = require('../errors/team-not-configured-error');
const RateLimitExceededError = require('../errors/rate-limit-exceeded-error');
const AliasNotExistError = require('../errors/alias-not-exist-error');
const LoggerFactory = require('../../core/logging/logger-factory');
const logger = LoggerFactory.getLogger(__filename);
const { teamConfigurationService } = require('../configuration');

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
  constructor(endpointResolver) {
    this.endpointResolver = endpointResolver;

    const axiosInstance = Axios.create();
    axiosInstance.defaults.headers.common['User-Agent'] =
      'logzio-slack-integration';
    this.axios = axiosInstance;
  }

  get(channelId, teamId, path, alias) {
    return this.sendRequest(
      channelId,
      teamId,
      HttpMethod.GET,
      path,
      undefined,
      alias
    );
  }

  post(channelId, teamId, path, body, alias) {
    return this.sendRequest(
      channelId,
      teamId,
      HttpMethod.POST,
      path,
      body,
      alias
    );
  }

  async validateConfigurationAndSendRequest(
    alias,
    teamId,
    channelId,
    method,
    path,
    body
  ) {
    const configuration = await teamConfigurationService.getOrDefault(
      alias,
      teamId,
      channelId
    );
    await HttpClient.validateConfiguration(configuration);
    const accountRegion = configuration.getLogzioAccountRegion();
    const apiToken = configuration.getLogzioApiToken();
    return this.sendRequestWithRegionAndToken(
      accountRegion,
      apiToken,
      method,
      path,
      body,
      configuration.getAlias()
    );
  }

  async sendRequest(channelId, teamId, method, path, body, alias) {
    if (alias) {
      const isValid = await teamConfigurationService.doesAliasExist(
        teamId,
        alias
      );
      if (!isValid) {
        throw new AliasNotExistError(
          "Sorry, there isn't an account with that alias. If you want to see your accounts, type `@Alice accounts`."
        );
      }
      return this.validateConfigurationAndSendRequest(
        alias,
        teamId,
        channelId,
        method,
        path,
        body
      );
    } else {
      return this.validateConfigurationAndSendRequest(
        alias,
        teamId,
        channelId,
        method,
        path,
        body
      );
    }
  }

  sendRequestWithRegionAndToken(
    accountRegion,
    apiToken,
    method,
    path,
    body,
    alias
  ) {
    let endpointUrl = this.endpointResolver.getEndpointUrl(accountRegion, path);
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
      .then(response => {
        response.data.alias = alias;
        return response.data;
      })
      .catch(err => {
        logger.error(err);
        if (err.response.status === 429) {
          throw new RateLimitExceededError(err.response.data.message);
        }
        throw err;
      });
  }

  getRealName(token, region) {
    return this.sendRequestWithRegionAndToken(
      region,
      token,
      HttpMethod.GET,
      '/v1/account-management/whoami'
    );
  }

  static validateConfiguration(configuration) {
    if (!configuration.getLogzioAccountRegion()) {
      throw new TeamNotConfiguredError(
        'Logz.io account region is not configured!'
      );
    }

    if (!configuration.getLogzioApiToken()) {
      throw new TeamNotConfiguredError('Logz.io api token is not configured!');
    }

    return Promise.resolve(configuration);
  }

  static async validateAlias(teamId, alias) {
    const isValid = await teamConfigurationService.doesAliasExist(
      teamId,
      alias
    );
    if (!isValid) {
      throw new AliasNotExistError(
        "Sorry, there isn't an account with that alias. If you want to see your accounts, type `@Alice accounts`."
      );
    }
    return isValid;
  }
}

module.exports = HttpClient;
