const { getEventMetadata } = require('./logging-metadata');

const logEvent = ({ userObject, action, eventName, logger, companyName }) => {
  logger.info(
    `User ${userObject.user} from team ${userObject.team}, customer name ${companyName} ${action}`,
    getEventMetadata(userObject, eventName, companyName)
  );

  console.log(
    `User ${userObject.user} from team ${userObject.team}, customer name ${companyName} ${action}`
  );
};

module.exports = {
  logEvent
};
