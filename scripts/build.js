({
    baseUrl: './',
    paths: {
    	almond: '../vendor/almond/almond'
    },
    mainConfigFile: 'require-config.js',
    name: 'almond',
    include: ['main'],
    optimize: 'none',
    out: function(text, sourceMapText) {
        var UglifyJS = require('uglify-es'),
            uglified = UglifyJS.minify(text);

        grunt.file.write('../dist/scripts/mentalmodeler.js', uglified.code);
    }
})