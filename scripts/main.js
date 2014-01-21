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
    }
});

require([    
    'jquery',
    'backbone',
    'underscore',
    'routes/app'
], function ( $, Backbone, _, App ) {
    window.mentalmodeler = new App();
    Backbone.history.start();
});

function flashInitialized() {
    window.mentalmodeler.appModel.addModel('');
} 