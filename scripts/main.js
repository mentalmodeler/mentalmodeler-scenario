/*global require*/
'use strict';

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        foundation: {
            deps: ['jquery'],
            exports: 'foundation'
        },
        downloadify: {
            deps: ['jquery'],
            exports: 'downloadify'
        },
        swfobject: {
            deps: [],
            exports: 'swfobject'
        },
        x2js: {
            exports: 'x2js'
        },
        tableExport: {
            deps: ['jquery'],
            exports: 'tableExport'
        },
        jqueryBase64: {
            deps: ['jquery'],
            exports: 'jqueryBase64'
        }
        // conceptmap: {
        //     exports: 'conceptmap'
        // }
    },
    paths: {
        jquery: '../vendor/jquery/jquery.min',
        backbone: '../vendor/backbone/backbone-min',
        underscore: '../vendor/underscore/underscore-min',
        foundation: '../vendor/foundation/foundation.min',
        text: '../vendor/requirejs-text/text',
        d3: '../vendor/d3/d3.v3.min',
        math: '../vendor/mathjs/math.min',
        swfobject: '../vendor/swfobject/swfobject',
        detect: '../vendor/detect/detect.min',
        x2js: '../vendor/x2js/xml2json',
        tableExport: '../vendor/tableExport/tableExport',
        jqueryBase64: '../vendor/tableExport/jquery.base64',
        // conceptmap: '../libs/conceptmap/js/main'
    }
});

require([
    'jquery',
    'backbone',
    'underscore',
    'routes/app'
    // 'conceptmap'
], function ( $, Backbone, _, App ) {
    var params = new URLSearchParams(document.location.search.substring(1));
    window.MentalModelerUseFlash = !!params.has('flash');
    window.mentalmodeler = new App();
    Backbone.history.start();
    console.log('-------- window.MentalModelerConceptMap:', window.MentalModelerConceptMap);
    if (!window.MentalModelerUseFlash && window.MentalModelerConceptMap) {
        // window.mentalmodeler.appModel.start();    
    }
});

window.flashInitialized = function() {
    if (window.MentalModelerUseFlash) {
        window.mentalmodeler.appModel.start();
    }
}
