/**
 * Created by meathill on 15/8/2.
 */
module.exports = function (grunt) {
  var dist = 'dist/';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      target: [dist]
    },
    compass: {
      target: {

      }
    },
    copy: {
      css: {
        files: [
          {
            expand: true,
            cwd: 'css/',
            src: ['*.css'],
            dest: dist + 'css/'
          }
        ]
      }
    },
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: dist + 'css/',
          src: ['*.css', '!*.min.css'],
          dest: dist + 'css/',
          ext: '.min.css'
        }]
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      js: {
        src: ['js/MeatMap.js', 'js/config.js'],
        dest: dist + 'js/MeatMap.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      target: {
        files: {
          'dist/js/MeatMap.min.js': [dist + 'js/MeatMap.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', [
    'clean',
    'compass',
    'copy',
    'cssmin',
    'concat',
    'uglify'
  ]);
};