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
        doLog: true,

        close: function () {
            this.log('AbstractModel > close');
        },

        setView: function (view) {
            // console.log( 'BaseModel > setView, view:',view );
            this.set('view', view);
        },

        getView: function() {
            // console.log( 'BaseModel > getView, view:', view );
            return this.get('view');
        },


        log: function() {
            if ( this.doLog === true ) {
                console.log.apply( console, arguments );
            }
        }
    });

    return AbstractModel;
});