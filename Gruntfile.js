module.exports = function(grunt) {
	var target = grunt.option('target');
	grunt.initConfig({
		compass: {
			dist: {
				options: {
					config:'config.rb',
					cssDir: 'dist/css',
					outputStyle: 'compressed' //expanded, nested, compact, orcompressed

				}
			}
		},
		watch: {
			css: {
				files: 'sass/*.scss',
				tasks: ['compass']
			}
		},
		requirejs: {
			compile: {
				options: {
					baseUrl: './scripts',
					mainConfigFile: 'scripts/require-config.js',
					include: ['main'],
					name: '../vendor/almond/almond',
					out: 'dist/scripts/mentalmodeler.min.js',
					//optimize: 'none',
					wrap: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', []);
	grunt.registerTask('compass', ['watch']);
	grunt.registerTask('dist', ['requirejs', 'compass']);
}

