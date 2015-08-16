'use strict';

var path = require('path');

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-mocha-istanbul');

    var allSourceFiles = ['*.js', 'lib/*.js'];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env: {
            test: { NODE_ENV: 'test' }
        },
        jscs: {
            src: allSourceFiles
        },
        jshint: {
            all: allSourceFiles,
            options: {
                reporter: require('jshint-stylish'),
                jshintrc: true
            }
        },
        mochaTest: {
            test: {
                options: { reporter: 'spec' },
                src: ['test/*.js']
            }
        },
        mocha_istanbul: {
            test: {
                src: 'test',
                options: {
                    coverage: true,
                    coverageFolder: path.join('coverage', 'test'),
                    mask: '*.js',
                    mochaOptions: ['-R', 'spec']
                }
            }
        },
        watch: {
            js: {
                options: {
                    spawn: true,
                    interrupt: true,
                    debounceDelay: 250,
                },
                files: ['app/*.js', 'test/*.js', '*.js'],
                tasks: ['test']
            }
        }
    });

    grunt.event.on('coverage', function (lcov, done) {
        require('coveralls').handleInput(lcov, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    grunt.registerTask('test', ['env:test', 'jshint', 'jscs', 'mochaTest:test']);
    grunt.registerTask('cover', ['env:test', 'jshint', 'jscs', 'mocha_istanbul']);
};
