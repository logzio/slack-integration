function getEventMetadata(message, eventName) {
  const metadata = {
    eventName
  };

  if (typeof message.team === 'string') {
    metadata['teamId'] = message.team;
  } else {
    metadata['teamId'] = message.team.id;
    metadata['teamDomain'] = message.team.domain;
  }

  if (typeof message.user === 'string') {
    metadata['userId'] = message.user;
  } else {
    metadata['userId'] = message.user.id;
    metadata['userName'] = message.user.name;
  }

  if (typeof message.channel === 'string') {
    metadata['channelId'] = message.channel;
  } else {
    metadata['channelId'] = message.channel.id;
    metadata['channelName'] = message.channel.name;
  }

  return metadata;
}

module.exports = {
  getEventMetadata
};
