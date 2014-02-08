/*global define*/

define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    'use strict';

    var AbstractView = Backbone.View.extend({
        doLog: true,
        logPrefix: '',

        initialize: function() {
            if ( typeof this.model !== 'undefined' ) {
                this.model.setView( this );
            }
        },

        assign: function (view, selector) {
            view.setElement(this.$(selector)).render();
        },

        log: function() {
            if ( this.doLog ) {
                var args = Array.prototype.slice.call(arguments);
                args.unshift( this.logPrefix );
                console.log.apply( console, args );
            }
        }
    });

    return AbstractView;
});