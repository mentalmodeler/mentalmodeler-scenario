/*global define*/

define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    'use strict';

    var AbstractView = Backbone.View.extend({
        initialize: function() {
            if ( typeof this.model !== 'undefined' ) {
                this.model.setView( this );
            }
        },

        assign: function (view, selector) {
            view.setElement(this.$(selector)).render();
        }
    });

    return AbstractView;
});