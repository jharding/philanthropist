module.exports = function(grunt) {
    grunt.initConfig({
        lint: {
            test: ['test/*.js'],
            lib: ['lib/options/*.js', 'lib/background/*.js']
        },
        qunit: {
            index: ['test/test.html']
        },
        jshint: {
            // enforcing options
            immed: false,
            strict: false,
            trailing: false,
            // environments
            browser: true,
            jquery: true,
            white: false
        }
    });

    grunt.registerTask('default', 'lint qunit');
};
