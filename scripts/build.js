({
    baseUrl: './',
    // optimize: 'none', //uncomment this option if built source needs to be debugged
    paths: {
    	almond: '../vendor/almond/almond'
    },
    mainConfigFile: 'require-config.js',
    name: 'almond',
    include: ['main'],
    out: '../dist/scripts/mentalmodeler.js'
})