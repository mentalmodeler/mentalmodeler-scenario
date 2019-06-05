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
					out: function(text, sourceMapText) {
						var UglifyJS = require('uglify-es'),
							uglified = UglifyJS.minify(text);
			
						grunt.file.write('dist/scripts/mentalmodeler.js', uglified.code);
					},
					optimize: 'none',
					wrap: true
				}
			}
		},
		copy: {
			files: {
				cwd: './libs',  // set working folder / root to copy
				src: '**/*',           // copy all files and subfolders
				dest: 'dist/',    // destination folder
				expand: true           // required when using cwd
				// cwd: 'path/to/files',  // set working folder / root to copy
				// src: '**/*',           // copy all files and subfolders
				// dest: 'dist/files',    // destination folder
				// expand: true           // required when using cwd
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', []);
	grunt.registerTask('scss', ['watch']);
	grunt.registerTask('dist', ['requirejs', 'compass', 'copy']);
}

