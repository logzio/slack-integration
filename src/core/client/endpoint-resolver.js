function getRegionEndpoint(config, region) {
  const regionConfig = config['regions'][region];
  if (!regionConfig || !regionConfig.endpoint) {
    throw new Error(`Missing config for region: ${region}`);
  }

  return regionConfig.endpoint;
}

class EndpointResolver {

  constructor(config) {
    this.config = config;
  }

  getEndpointUrl(region, path) {
    const endpoint = getRegionEndpoint(this.config, region);
    const trimmedPath = path.replace(/^\/|\/$/g, '');

    return `${endpoint}/${trimmedPath}`
  }

}

module.exports = EndpointResolver;
