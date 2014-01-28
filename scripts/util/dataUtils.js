/* global define */

define([
    'jquery',
    'underscore'

], function ($, _) {

    'use strict';

    var dataUtils = {};

    // makes a [length]-character unique string that always begins with an alphabetic character
    dataUtils.makeID = function (moduleType) {
        var id = '';
        var length = 16;
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var startIndexForNumbers = 53;
        // modified to ensure the first character is always a letter
        for (var i = 0; i < 5; i++) {
            if ( i === 0 ) {
                id += possible.charAt(Math.floor(Math.random() * startIndexForNumbers));
            } else {
                id += possible.charAt(Math.floor(Math.random() * possible.length));
            }
        }
        return id;
    };

    return dataUtils;
});


