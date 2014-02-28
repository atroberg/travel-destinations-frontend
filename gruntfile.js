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
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task(s).
  grunt.registerTask('default', ['browserify', 'jshint']);

};
