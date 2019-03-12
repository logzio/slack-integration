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

    return Promise.all(promiseList)
      .then(accounts => {

          if (accounts.length === 0) {
            return '';
          }
          const hasPrivateChannel = accounts.some(channel => channel.isPrivate);
          const channelMap = accounts.map(
            channel => {
              if (!channel.isPrivate) {
                return ` <#${channel.channelId}|${channel.channelName}>`
              }
            }
          ).filter(x => typeof x === 'string' && x.length > 0);
          const channelMapPrefix = channelMap.join(',');
          if (hasPrivateChannel) {
            return channelMapPrefix + (channelMap.length > 0 ? ', ' : ' ') + 'one or more private channels';
          } else {
            return channelMapPrefix;
          }
        }
      )
  }

  static extractChannelName(bot, channelId) {
    return new Promise(resolve => {
      bot.api.channels.info({ channel: channelId }, (err, response) => {
        if (response.ok) {
          resolve({
            channelName: response.channel.name.toString(),
            isPrivate : false});

        } else {
          resolve({
            channelName: 'private channel',
            isPrivate : true
          });
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
            channelId: channelId,
            isPrivate : false
          });
        } else {
          resolve({
            channelName: 'private',
            channelId: channelId,
            isPrivate : true
          });
        }
      });
    });
  }

  static createAccountDescription(item) {
    return `• \`${item.accountAlias}\`: Slack alias for ${item.accountName}.${ApiExtract.defaultSuffixIfDefault(item.isDefault)}${ApiExtract.createChannelNames(item)}\n`;
  }

  static defaultSuffixIfDefault(isDefault) {
    return isDefault ? ' *This is the default workspace account.*' : '';
  }

  static createChannelNames(item) {

    if (item.channels.length === 0) {
      return '';
    }
    const hasPrivateChannel = item.channels.some(channel => channel.isPrivate);
    const channelMap = item.channels.map(
      channel => {
        if (!channel.isPrivate) {
          return `<#${channel.channelId}|${channel.channelName}>`
        }
      }
    ).filter(x => typeof x === 'string' && x.length > 0);
    const channelMapPrefix = ` This is the channel account for ` + channelMap.join(',');
    if (hasPrivateChannel) {
      return channelMapPrefix + (channelMap.length > 0 ? ', ' : '') + 'one or more private channels' + '.';
    } else {
      return channelMapPrefix + '.';
    }
  }


}

module.exports = ApiExtract;
