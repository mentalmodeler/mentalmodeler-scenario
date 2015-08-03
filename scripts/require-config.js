/*global require*/
'use strict';

require.config({
    baseUrl: './scripts',
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
        }
    },
    paths: {
        jquery: '../vendor/jquery/jquery.min',
        backbone: '../vendor/backbone/backbone-min',
        underscore: '../vendor/underscore/underscore-min',
        foundation: '../vendor/foundation/foundation.min',
        text: '../vendor/requirejs-text/text',
        d3: '../vendor/d3/d3.v3.min',
        sylvester: '../vendor/sylvester/sylvester',
        downloadify: '../vendor/downloadify/js/downloadify.min',
        swfobject: '../vendor/downloadify/js/swfobject',
        detect: '../vendor/detect/detect.min',
        x2js: '../vendor/x2js/xml2json.min'
    }
});
