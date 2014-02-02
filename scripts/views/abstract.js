/*global define*/

define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    'use strict';

    var AbstractView = Backbone.View.extend({
        doLog: true,

        initialize: function() {
            if ( typeof this.model !== 'undefined' ) {
                this.model.setView( this );
            }
        },

        assign: function (view, selector) {
            view.setElement(this.$(selector)).render();
        },

        log: function() {
            if ( this.doLog === true ) {
                console.log.apply( console, arguments );
            }
        }
    });

    return AbstractView;
});