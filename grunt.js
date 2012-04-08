module.exports = function(grunt) {
    grunt.initConfig({
        less: {
            all: {
                src: ['public/css/style.less'],
                dest: 'public/css/style.css'
            }
        },
        watch: {
            files: 'public/css/**/*.less',
            tasks: 'less'
        }
    });

    grunt.loadNpmTasks('grunt-less');
};
