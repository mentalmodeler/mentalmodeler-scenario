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
        }
    },
    paths: {
        jquery: '../vendor/jquery/jquery.min',
        jquerySwfobject: '../vendor/jquery-swfobject',
        backbone: '../vendor/backbone/backbone-min',
        underscore: '../vendor/underscore/underscore-min',
        foundation: '../vendor/foundation/foundation.min',
        text: '../vendor/requirejs-text/text',
        filesaver: '../vendor/filesaver/FileSaver',
        d3: '../vendor/d3/d3.v3.min',
        sylvester: '../vendor/sylvester/sylvester'
    }
});
