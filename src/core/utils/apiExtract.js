class ApiExtract {
  static extractAccountsChannelsWithId(bot, accounts) {
    let promiseList = accounts.map(account =>
      this.extractChannelNameAndId(bot, account.id)
    );
    return Promise.all(promiseList);
  }

  static extractAccountsChannels(bot, accounts) {
    let promiseList = accounts.map(account =>
      this.extractChannelName(bot, account.id)
    );
    return Promise.all(promiseList);
  }

  static extractChannelName(bot, channelId) {
    return new Promise(resolve => {
      bot.api.channels.info({ channel: channelId }, (err, response) => {
        if (response.ok) {
          resolve(response.channel.name.toString());
        }
      });
    });
  }

  static extractChannelNameAndId(bot, channelId) {
    return new Promise(resolve => {
      bot.api.channels.info({ channel: channelId }, (err, response) => {
        if (response.ok) {
          resolve({
            channelName: response.channel.name.toString(),
            channelId: channelId
          });
        } else {
          resolve({
            channelName: 'no-channel',
            channelId: channelId
          });
        }
      });
    });
  }
}

module.exports = ApiExtract;
