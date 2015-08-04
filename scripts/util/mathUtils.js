/* global define */

define([
    'jquery',
    'underscore'

], function ($, _) {

    'use strict';

    var mathUtils = {};

    // makes a [length]-character unique string that always begins with an alphabetic character
    mathUtils.round = function (number, precision) {
        var prec = Math.pow( 10, precision );
        return Math.round(number * prec) / prec;
    };

    return mathUtils;
});


