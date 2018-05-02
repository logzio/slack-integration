const Jasmine = require('jasmine');
const { SpecReporter } = require('jasmine-spec-reporter');

const jasmine = new Jasmine();
jasmine.loadConfig({
  "spec_dir": "src",
  "spec_files": [
    "**/*[sS]pec.js"
  ],
  "helpers": [
    "helpers/**/*.js"
  ],
  stopSpecOnExpectationFailure: false,
  random: false
});

jasmine.clearReporters();
jasmine.addReporter(new SpecReporter());

jasmine.execute();
