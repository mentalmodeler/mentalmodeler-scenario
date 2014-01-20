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
        bootstrap: {
            deps: ['jquery'],
            exports: 'bootstrap'
        }
    },
    paths: {
        /* all these are being added to the Gruntfile require.config under dist:options:excludeShallow AND copy */
        jquery: '../vendor/jquery/jquery.min',
        backbone: '../vendor/backbone/backbone-min',
        underscore: '../vendor/underscore/underscore-min',
        bootstrap: '../vendor/bootstrap/js/bootstrap.min',
        text: '../vendor/requirejs-text/text'
    }
});