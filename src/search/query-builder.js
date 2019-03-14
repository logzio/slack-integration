const TimeUnit = require('../core/time/time-unit');

function getNowUtc() {
  const now = new Date();
  return Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds()
  );
}

class QueryBuilder {
  constructor() {
    this.withRelativeTime(15, TimeUnit.MINUTES);
    this.withMaxResults(50);
  }

  withQueryString(queryString) {
    this.queryString = queryString;
    return this;
  }

  withExactTime(fromTimestamp, toTimestamp) {
    this.timeRange = {
      range: {
        '@timestamp': {
          gte: fromTimestamp,
          lte: toTimestamp
        }
      }
    };

    return this;
  }

  withRelativeTime(value, timeUnit) {
    const nowUtc = getNowUtc();
    const fromTimestamp = nowUtc - timeUnit.toMillis(value);

    return this.withExactTime(fromTimestamp, nowUtc);
  }

  withMaxResults(size) {
    this.size = size;
  }

  build() {
    return {
      size: this.size,
      sort: [
        {
          '@timestamp': {
            order: 'desc',
            unmapped_type: 'boolean'
          }
        }
      ],
      query: {
        bool: {
          must: [
            {
              query_string: {
                query: this.queryString,
                analyze_wildcard: true
              }
            },
            this.timeRange
          ]
        }
      }
    };
  }
}

module.exports = QueryBuilder;
