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
        logPrefix: '',

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
            if ( this.doLog ) {
                var args = Array.prototype.slice.call(arguments);
                args.unshift( this.logPrefix );
                console.log.apply( console, args );
            }
        }
    });

    return AbstractModel;
});