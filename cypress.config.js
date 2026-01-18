const { defineConfig } = require('cypress')
const webpackPreprocessor = require("@cypress/webpack-preprocessor");

module.exports = defineConfig({
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:8888',
    setupNodeEvents(on, config) {
      const options = webpackPreprocessor.defaultOptions || {};

      options.webpackOptions = options.webpackOptions || {};
      options.webpackOptions.module = options.webpackOptions.module || {};
      options.webpackOptions.module.rules = [
        ...(options.webpackOptions.module.rules || []),
        { test: /\.html$/i, type: "asset/source" },
      ];

      on("file:preprocessor", webpackPreprocessor(options));
      return config;
    },
  },
})
