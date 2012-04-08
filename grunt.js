module.exports = function(grunt) {
    grunt.initConfig({
        less: {
            dev: {
                src: ['public/css/style.less'],
                dest: 'public/css/style.css'
            },
            prod: {
                src: ['public/css/style.less'],
                dest: 'public/css/style.css',
                options: {
                    yuicompress: true
                }
            }
        },
        watch: {
            files: 'public/**/*.less',
            tasks: 'less:dev'
        }
    });

    grunt.loadNpmTasks('grunt-less');

    grunt.registerTask('prod', 'less:prod');
};
