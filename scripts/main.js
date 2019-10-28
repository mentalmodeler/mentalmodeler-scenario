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
        html2canvas: {
            exports: 'html2canvas'
        }
    },
    paths: {
        jquery: '../vendor/jquery/jquery.min',
        backbone: '../vendor/backbone/backbone-min',
        underscore: '../vendor/underscore/underscore-min',
        filesaver: '../vendor/filesaver/FileSaver',
        foundation: '../vendor/foundation/foundation.min',
        text: '../vendor/requirejs-text/text',
        dagre: '../vendor/dagre/dagre.min',
        d3: '../vendor/d3/d3.v3.min',
        math: '../vendor/mathjs/math.min',
        swfobject: '../vendor/swfobject/swfobject',
        detect: '../vendor/detect/detect.min',
        x2js: '../vendor/x2js/xml2json',
        tableExport: '../vendor/tableExport/tableExport',
        html2canvas: '../vendor/html2canvas',
        papaparse: '../vendor/papaparse/papaparse.min'
    }
});

require([
    'jquery',
    'backbone',
    'underscore',
    'routes/app',
    'html2canvas'
], function ( $, Backbone, _, App, html2canvas ) {
    var params = new URLSearchParams(document.location.search.substring(1));
    window.MentalModelerUseFlash = !params.has('noflash');
    // console.log('\nMain\n\twindow.MentalModelerConceptMap:', window.MentalModelerConceptMap, '\n\twindow.MentalModelerUseFlash:', window.MentalModelerUseFlash);
    window.mentalmodeler = new App();
    window.html2canvas = html2canvas;
    Backbone.history.start();
    if (!window.MentalModelerUseFlash && window.MentalModelerConceptMap) {
        window.mentalmodeler.appModel.start();    
    }
});

window.flashInitialized = function() {
    if (window.MentalModelerUseFlash) {
        window.mentalmodeler.appModel.start();
    }
};
