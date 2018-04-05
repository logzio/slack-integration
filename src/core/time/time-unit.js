function parseTimeUnitString(timeUnitStr) {
  const trimmedTimeUnitStar = timeUnitStr.trim();

  if (trimmedTimeUnitStar.match(/^(minutes?|mins?|m)$/)) {
    return TimeUnit.MINUTES;
  }

  if (trimmedTimeUnitStar.match(/^(hours?|h)$/)) {
    return TimeUnit.HOURS;
  }

  throw new Error(`Unable to parse time unit string: '${trimmedTimeUnitStar}'`);
}

class TimeUnitImpl {

  constructor(multiplierToMillis) {
    this.multiplierToMillis = multiplierToMillis;
  }

  toMillis(value) {
    return value * this.multiplierToMillis;
  }

}

const TimeUnit = {
  MINUTES: new TimeUnitImpl(60 * 1000),
    HOURS: new TimeUnitImpl(60 * 60 * 1000),
    parse: parseTimeUnitString,
};

module.exports = TimeUnit;
