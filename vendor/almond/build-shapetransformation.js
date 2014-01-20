({
    baseUrl: '.',
    //optimize: 'none', //uncomment this option if built source needs to be debugged
    paths: {
    	almond: '../../libs/almond'
    },
    name: 'almond',
    include: ['main'],
    wrap: {
    	startFile: 'start.frag',
    	endFile: 'end.frag'
    },
    out: '../../deploy/shapetransformation/shapetransformation-lib.js'
})