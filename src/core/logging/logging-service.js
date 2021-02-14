const { getEventMetadata } = require('./logging-metadata');

const logEvent = ({ userObject, action, eventName, logger, companyName }) => {
  console.log(
    `User ${userObject.user} from team ${userObject.team}, customer name ${companyName} ${action}`
  );

  logger.info(
    `User ${userObject.user} from team ${userObject.team}, customer name ${companyName} ${action}`,
    getEventMetadata({ message: userObject, eventName, companyName })
  );
};

module.exports = {
  logEvent
};
