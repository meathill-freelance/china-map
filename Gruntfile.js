/**
 * Created by meathill on 15/8/2.
 */
module.exports = function (grunt) {
  var dist = 'dist/'
    , temp = 'temp/';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      start: [temp, dist],
      end: [temp]
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
      },
      wrap: {
        src: 'js/wrapper.js',
        dest: dist + 'js/MeatMap.js',
        options: {
          process: function (content, path) {
            var code = grunt.file.read(temp + 'class.js');
            content = content.replace('{{version}}', grunt.config.get('pkg').version);
            return content.replace('/* -- js content here -- */', code);
          }
        }
      }
    },
    concat: {
      options: {
        separator: ';\n',
        banner: "'use strict';\n",
        process: function(src, filepath) {
          return '// Source: ' + filepath + '\n' +
            src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
        },
        stripBanners: true
      },
      js: {
        src: [
          'js/utils.js',
          'js/Tip.js',
          'js/MeatMap.js',
          'js/config.js',
          'js/event.js'
        ],
        dest: temp + 'class.js'
      },
      lib: {
        src: [
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/raphael/raphael-min.js',
          'bower_components/underscore/underscore-min.js',
          'bower_components/handlebars/handlebars.min.js'
        ],
        dest: dist + 'js/lib.js'
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
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', [
    'clean:start',
    'compass',
    'copy:css',
    'concat',
    'copy:wrap',
    'uglify',
    'clean:end'
  ]);
};