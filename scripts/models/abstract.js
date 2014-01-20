/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone'

], function ( $, _, Backbone ) {
    'use strict';

    var AbstractModel = Backbone.Model.extend({
            defaults: {
                view: null
            },

            setView: function (view) {
                // console.log( 'BaseModel > setView, view:',view );
                this.set('view', view);
            },

            getView: function() {
                // console.log( 'BaseModel > getView, view:', view );
                return this.get('view');
            }
        });

    return AbstractModel;
});