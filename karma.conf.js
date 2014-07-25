// Karma configuration
// Generated on Tue Apr 08 2014 11:11:50 GMT-0300 (BRT)
// Generate with `karma init karma.conf.js`

module.exports = function(config) {
  var config_data = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],

    client: {
      mocha: {
        ui: 'tdd'
      }
    },

    // list of files / patterns to load in the browser
    files: [
        'components/*.js',
        'src/hoe.js',  // must be loaded before
        'src/*.js',
        'test/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
        'Firefox'
    //    'PhantomJS' // several probelms with PhantomJS
    ],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  }

    // change config to perform coverage
    if (process.env.KARMA_MODE == 'coverage'){
        config_data.preprocessors = {
            'src/*.js': ['coverage'],
            'test/test_*.js': ['coverage']
        };
        config_data.reporters.push('coverage');
        config_data.coverageReporter = {
            type: 'html',
            dir: 'coverage/'
        };
    }

  config.set(config_data);
};
