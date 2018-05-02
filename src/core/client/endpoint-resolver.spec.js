const EndpointResolver = require('./endpoint-resolver');

describe('EndpointResolver', () => {

  const config = {
    regions: {
      'us-east-1': {
        endpoint: 'http://api.logz.io'
      },
      'eu-central-1': {
        endpoint: 'http://api-eu.logz.io'
      }
    }
  };

  const endpointResolver = new EndpointResolver(config);

  it('should concat the path to the right region api domain', () => {
    expect(endpointResolver.getEndpointUrl('us-east-1', 'whoami')).toBe('http://api.logz.io/whoami');
    expect(endpointResolver.getEndpointUrl('eu-central-1', 'whoami')).toBe('http://api-eu.logz.io/whoami');
  });

  it('should throw exception when the region is not configured', () => {
    const unconfiguredRegion = 'unconfigured_region';
    expect(() => endpointResolver.getEndpointUrl(unconfiguredRegion, 'whoami'))
      .toThrowError(new RegExp(`.*${unconfiguredRegion}.*`));
  });

});
