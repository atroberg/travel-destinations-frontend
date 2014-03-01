module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    browserify: {
      dist: {
        files: {
          'phonegap/www/js/bundle.js': ['app.js']
        },
        options: {
          transform: ['hbsfy']
        },
      }
    },
    jshint: {
      files: ['gruntfile.js', 'js/modules/*.js', 'js/*.js'],
    },
    sass: {
      dist: {
        files: {
          'phonegap/www/css/main.css': 'sass/main.scss'
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-sass');

  // Default task(s).
  grunt.registerTask('default', ['browserify', 'jshint']);
  grunt.registerTask('all', ['browserify', 'jshint', 'sass']);

};
