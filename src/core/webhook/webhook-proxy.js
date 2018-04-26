const LoggerFactory = require('../logging/logger-factory');

const logger = LoggerFactory.getLogger(__filename);

function createWebhookProxyEndpoint(logzioBot, webserver) {
  const controller = logzioBot.controller;
  const endpointUrl = '/webhook/:teamId/:channelId';
  webserver.post(endpointUrl, (req, res) => {
    const { teamId, channelId } = req.params;
    const teamBot = Object.values(logzioBot.bots).filter(bot => bot.identifyTeam() === teamId)[0];
    if (!teamBot) {
      res.status(500).json({ message: `Unable to find bot for teamId: ${teamId}` });
      return;
    }

    const slackMessage = req.body;
    delete slackMessage.icon_url;
    delete slackMessage.username;

    teamBot.reply({ channel: channelId }, slackMessage, (err) => {
      if (err) {
        logger.error(`Failed to forward webhook request to team: ${teamId}, channel: ${channelId}`, err);
        res.status(500).json({ message: 'Failed to forward webhook request, please try again later.' });
        return;
      }

      res.status(200).json({ message: 'ok' });
    })
  });

  logger.info(`** Serving webhook proxy endpoint at: http://${controller.config.hostname}:${controller.config.port}${endpointUrl}`);
}

module.exports = { createWebhookProxyEndpoint };
