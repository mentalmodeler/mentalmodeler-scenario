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
        filesaver: {
            exports: 'filesaver'
        },
        foundation: {
            deps: ['jquery'],
            exports: 'foundation'
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
        },
        html2canvas: {
            exports: 'html2canvas'
        }
        // conceptmap: {
        //     exports: 'conceptmap'
        // }
    },
    paths: {
        jquery: '../vendor/jquery/jquery.min',
        backbone: '../vendor/backbone/backbone-min',
        underscore: '../vendor/underscore/underscore-min',
        filesaver: '../vendor/filesaver/FileSaver',
        foundation: '../vendor/foundation/foundation.min',
        text: '../vendor/requirejs-text/text',
        d3: '../vendor/d3/d3.v3.min',
        math: '../vendor/mathjs/math.min',
        swfobject: '../vendor/swfobject/swfobject',
        detect: '../vendor/detect/detect.min',
        x2js: '../vendor/x2js/xml2json.min',
        tableExport: '../vendor/tableExport/tableExport',
        jqueryBase64: '../vendor/tableExport/jquery.base64',
        html2canvas: '../vendor/html2canvas'
        // conceptmap: '../libs/conceptmap/js/main'
    }
});
