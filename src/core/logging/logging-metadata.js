function getEventMetadata(message, eventName) {
  return {
    eventName,
    teamId: message.team.id,
    teamDomain: message.team.domain,
    userId: message.user.id,
    userName: message.user.name,
    channelId: message.channel.id,
    channelName: message.channel.name,
  }
}

module.exports = {
  getEventMetadata
};
