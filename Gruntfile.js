/*global module:false*/
module.exports = function(grunt) {
  var _ = require("underscore");

  var jasmineVendor = [
    'public/javascripts/jquery-1.9.0.js',
    'public/javascripts/json2.js',
    'public/javascripts/underscore.js',
    'public/javascripts/backbone-1.0.0.js',
    'public/javascripts/backbone.babysitter.js',
    'public/javascripts/backbone.wreqr.js',
  ];

  // Define the files that jasmine should use to test
  var jasmineSrc = [
    'src/build/marionette.core.js',
    'spec/javascripts/support/marionette.support.js',
    'src/marionette.helpers.js',
    'src/marionette.createObject.js',
    'src/marionette.triggermethod.js',
    'src/marionette.bindEntityEvents.js',
    'src/marionette.controller.js',
    'src/marionette.domRefresh.js',
    'src/marionette.view.js',
    'src/marionette.itemview.js',
    'src/marionette.collectionview.js',
    'src/marionette.compositeview.js',
    'src/marionette.region.js',
    'src/marionette.regionManager.js',
    'src/marionette.layout.js',
    'src/marionette.application.js',
    'src/marionette.approuter.js',
    'src/marionette.module.js',
    'src/marionette.templatecache.js',
    'src/marionette.renderer.js',
    'src/marionette.callbacks.js'
  ];

  // Define the combinations of Backbone and jQuery
  // to use for jasmine specs
  var multiVersionSpecConfig = {
    root: "public/javascripts/",
    backbone: [
      "backbone-0.9.9.js", 
      "backbone-0.9.10.js", 
      "backbone-1.0.0.js"
    ],
    jQuery: [
      "jquery-1.7.2.js", 
      "jquery-1.8.3.js", 
      "jquery-1.9.0.js", 
    ]
  };

  // build the multiple versions of the jQuery and Backbone
  // configuration for jasmine to use

  var multiVersionSpecs = (function(config, vendor){
    var i, j, backbone, jQuery;
    var updatedVendor;

    var root = config.root;
    var jasmine = {};

    // loop over backbone versions
    for(var i = 0; i < config.backbone.length; i++){
      backbone = config.backbone[i];
      // loop over jQuery versions
      for(var j = 0; j < config.backbone.length; j++){
        jQuery = config.jQuery[j];

        updatedVendor = _.clone(vendor);
        updatedVendor[0] = config.root + jQuery;
        updatedVendor[3] = config.root + backbone;

        // build the config
        jasmine[backbone + "-" + jQuery] = {
          src : jasmineSrc,
          options: { vendor: updatedVendor }
        }

      }
    }

    return jasmine;
  })(multiVersionSpecConfig, jasmineVendor);

  // Project configuration.
  var gruntConfig = {
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      version: '<%= pkg.version %>',
      core_banner: 
        '// MarionetteJS (Backbone.Marionette)\n' +
        '// ----------------------------------\n' + 
        '// v<%= pkg.version %>\n' +
        '//\n' + 
        '// Copyright (c)<%= grunt.template.today("yyyy") %> Derick Bailey, Muted Solutions, LLC.\n' +
        '// Distributed under MIT license\n' +
        '//\n' + 
        '// http://marionettejs.com\n' +
        '\n',

      banner:
        '<%= meta.core_banner %>\n\n' +
        '/*!\n' +
        ' * Includes BabySitter\n' +
        ' * https://github.com/marionettejs/backbone.babysitter/\n' +
        ' *\n' + 
        ' * Includes Wreqr\n' +
        ' * https://github.com/marionettejs/backbone.wreqr/\n' +
        ' */\n\n'
    },

    lint: {
      files: ['src/marionette.*.js']
    },

    preprocess: {
      core_build: {
        files: {
          'lib/core/backbone.marionette.js' : 'src/build/marionette.core.js'
        }
      },
      core_amd: {
        files: {
          'lib/core/amd/backbone.marionette.js' : 'src/build/amd.core.js'
        }
      },
    },

    concat: {
      options: {
        banner: "<%= meta.banner %>"
      },
      build: {
        src: [
               'public/javascripts/backbone.babysitter.js',
               'public/javascripts/backbone.wreqr.js',
               'lib/core/backbone.marionette.js',
             ],
        dest: 'lib/backbone.marionette.js'
      }
    },

    uglify : {
      options: {
        banner: "<%= meta.banner %>"
      },
      amd : {
        src : 'lib/core/amd/backbone.marionette.js',
        dest : 'lib/core/amd/backbone.marionette.min.js',
      },
      core : {
        src : 'lib/core/backbone.marionette.js',
        dest : 'lib/core/backbone.marionette.min.js',
        options : {
          sourceMap : 'lib/core/backbone.marionette.map',
          sourceMappingURL : 'backbone.marionette.map',
          sourceMapPrefix : 2,
        }
      },
      bundle : {
        src : 'lib/backbone.marionette.js',
        dest : 'lib/backbone.marionette.min.js',
        options : {
          sourceMap : 'lib/backbone.marionette.map',
          sourceMappingURL : 'backbone.marionette.map',
          sourceMapPrefix : 1
        }
      }
    },

    jasmine : {
      options : {
        helpers : 'spec/javascripts/helpers/*.js',
        specs : 'spec/javascripts/**/*.spec.js',
        vendor : jasmineVendor,
      },
      coverage : {
        src : '<%= jasmine.marionette.src %>',
        options : {
          template : require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            coverage: 'reports/coverage.json',
            report: 'reports/coverage'
          }
        }
      },
      marionette : {
        src : jasmineSrc,
      }
    },

    jshint: {
      options: {
        jshintrc : '.jshintrc'
      },
      marionette : [ 'src/*.js' ]
    },
    plato: {
      marionette : {
        src : 'src/*.js',
        dest : 'reports',
        options : {
          jshint : grunt.file.readJSON('.jshintrc')
        }
      }
    },
    watch: {
      marionette : {
        files : ['src/**/*.js', 'spec/**/*.js'],
        tasks : ['jshint', 'jasmine:marionette']
      },
      server : {
        files : ['src/**/*.js', 'spec/**/*.js'],
        tasks : ['jasmine:marionette:build']
      }
    },

    connect: {
      server: {
        options: {
          port: 8888
        }
      }
    }
  };

  // Add the multiple backbone-jQuery specs to the
  // grunt configuration
  _.extend(gruntConfig.jasmine, multiVersionSpecs);

  // configure grunt and add tasks
  grunt.initConfig(gruntConfig);

  grunt.loadNpmTasks('grunt-preprocess');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-plato');

  grunt.registerTask('test', ['jshint', 'jasmine:marionette']);

  grunt.registerTask('dev', ['test', 'watch:marionette']);

  grunt.registerTask('server', ['jasmine:marionette:build', 'connect:server', 'watch:server']);

  // Default task.
  grunt.registerTask('default', ['jshint', 'jasmine', 'preprocess', 'concat', 'uglify']);

};
