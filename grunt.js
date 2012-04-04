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
            bitwise: true,
            curly: true,
            eqeqeq: true,
            forin: true,
            immed: false,
            lastdef: true,
            newcap: true,
            noarg: true,
            noempty: true,
            nonew: true,
            plusplus: true,
            regex: true,
            undef: true,
            strict: false,
            trailing: false,

            // relaxing options
            asi: false,
            boss: false,
            debug: false,
            eqnull: false,
            es5: false,
            esnext: false,
            evil: false,
            expr: false,
            funcscope: false,
            globalstrict: false,
            iterator: false,
            lastsemic: false,
            laxbreak: false,
            laxcomma: false,
            loopfunc: false,
            multistr: false,
            onecase: false,
            proto: false,
            regexdash: false,
            scripturl: false,
            smarttabs: false,
            shadow: false,
            sub: false,
            supernew: false,
            validthis: false,

            // environments
            browser: true,
            couch: false,
            devel: false,
            dojo: true,
            jquery: true,
            mootools: false,
            node: false,
            nonstandard: false,
            prototypejs: false,
            rhino: false,
            wsh: false,

            // legacy
            nomen: false,
            onevar: false,
            passfail: false,
            white: false
        }
    });

    grunt.registerTask('default', 'lint qunit');
};
