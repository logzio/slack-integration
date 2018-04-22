function filterAlertsByName(alerts, alertName) {
  return alerts.filter(alert => alert.title.toLowerCase().includes(alertName.toLowerCase()));
}

class AlertsClient {

  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  getAlertByName(teamId, alertName) {
    return this.httpClient.get(teamId, '/v1/alerts')
      .then(alerts => filterAlertsByName(alerts, alertName))
      .then(matchedAlerts => {
        if (matchedAlerts.length === 0) {
          throw new Error(`Unable to find alert with title ${alertName}`);
        }

        if (matchedAlerts.length > 1) {
          throw new Error(`There are multiple alerts with title ${alertName}`);
        }

        return matchedAlerts[0];
      });
  }

}

module.exports = AlertsClient;
