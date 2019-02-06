class SnapshotsClient {

  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  createSnapshot(channelId, teamId, slackUsername, objectType, objectId, fromTS, toTS, query, webhookUrl , alias) {
    const request = {
      snapshotType: objectType.toUpperCase(),
      snapshotSavedObjectId: objectId,
      message: `Snapshot with query: \`${query}\``,
      timeFrameFrom: fromTS,
      timeFrameTo: toTS,
      snapshotTimeZone: 'UTC',
      queryString: query,
      darkTheme: true,
      slackWebhookUrls: [webhookUrl]
    };

    return this.httpClient.post(channelId, teamId, '/v1/snapshotter', request, alias);
  }

}

module.exports = SnapshotsClient;
