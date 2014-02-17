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
        jquerySwfobject: {
            deps: ['jquery'],
            exports: 'jquerySwfobject'
        },
        downloadify: {
            deps: ['jquery'],
            exports: 'downloadify'
        },
        swfobject: {
            deps: [],
            exports: 'swfobject'
        }
    },
    paths: {
        jquery: '../vendor/jquery/jquery.min',
        jquerySwfobject: '../vendor/jquery-swfobject',
        backbone: '../vendor/backbone/backbone-min',
        underscore: '../vendor/underscore/underscore-min',
        foundation: '../vendor/foundation/foundation.min',
        text: '../vendor/requirejs-text/text',
        d3: '../vendor/d3/d3.v3.min',
        sylvester: '../vendor/sylvester/sylvester',
        downloadify: '../vendor/downloadify/js/downloadify.min',
        swfobject: '../vendor/downloadify/js/swfobject'
    }
});
