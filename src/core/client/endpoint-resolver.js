class EndpointResolver {
  constructor(config) {
    this.config = config;
  }

  getEndpointUrl(region, path) {
    const endpoint = this.getRegionEndpoint(region);
    const trimmedPath = path.replace(/^\/|\/$/g, '');

    return `${endpoint}/${trimmedPath}`; 
  }

  getRegionEndpoint(region) {
    const regionConfig = this.config['regions'][region];
    if (!regionConfig || !regionConfig.endpoint) {
      throw new Error(`Missing config for region: ${region}`);
    }

    return regionConfig.endpoint;
  }
}

module.exports = EndpointResolver;
