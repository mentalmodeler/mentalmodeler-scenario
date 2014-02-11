/* global define */

define([
    'jquery',
    'underscore'

], function ($, _) {

    'use strict';

    var displayUtils = {};

    /*
     * returns an object with the width and height of the viewport
     */
    displayUtils.getViewportSize = function () {
        var e = window;
        var a = 'inner';
        if ( !( 'innerWidth' in window ) )
        {
            a = 'client';
            e = document.documentElement || document.body;
        }
        return { width : e[a + 'Width'] , height: e[a + 'Height'] };
    };

    return displayUtils;
});