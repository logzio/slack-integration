function getEventMetadata({ message, eventName, log, companyName }) {
  const metadata = {
    eventName
  };

  if (typeof message.team === 'string') {
    metadata['team'] = message.team;
  } else {
    metadata['team'] = message.team.id;
    metadata['teamDomain'] = message.team.domain;
  }

  if (typeof message.user === 'string') {
    metadata['user'] = message.user;
  } else {
    metadata['user'] = message.user.id;
    metadata['userName'] = message.user.name;
  }

  if (typeof message.channel === 'string') {
    metadata['channel'] = message.channel;
  } else {
    metadata['channel'] = message.channel.id;
    metadata['channelName'] = message.channel.name;
  }

  metadata['companyName'] = companyName;
  metadata['log'] = log;

  return metadata;
}

module.exports = {
  getEventMetadata
};
