module.exports = function (config) {
  config.set({
    frameworks: ["mocha", "sinon-chai"],
    files: ["built/unit-tests.js"],
    reporters: ["spec"],
    specReporter: {
      maxLogLines: 5, // limit number of lines logged per test
      suppressErrorSummary: false, // do not print error summary
      suppressFailed: false, // do not print information about failed tests
      suppressPassed: false, // do not print information about passed tests
      suppressSkipped: false, // do not print information about skipped tests
      showSpecTiming: true, // print the time elapsed for each spec
      failFast: false, // test would finish with error when a first fail occurs.
    },
    logLevel: config.LOG_INFO,
    browsers: ["ChromeHeadless"],
    autoWatch: false,
    singleRun: true, // Karma captures browsers, runs the tests and exits
    concurrency: Infinity,
    plugins: ["karma-mocha", "karma-spec-reporter", "karma-chrome-launcher", "karma-sinon-chai"],
  });
};
