/*global define*/

define([
    'jquery',
    'underscore',
    'backbone'
], function ($, _, Backbone) {
    'use strict';

    var AbstractView = Backbone.View.extend({
        initialize: function() {
            if ( this.model !== null ) {
                this.model.setView( this );
            }
        },

        assign: function (view, selector) {
            view.setElement(this.$(selector)).render();
        }
    });

    return AbstractView;
});