/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract'

], function ( $, _, Backbone, AbstractModel ) {
    'use strict';

    var InfoModel = AbstractModel.extend({
            defaults: {
                name: 'New Model',
                author: '',
                description: '',
                version: '',
                date: ''
            },

            initialize: function () {
                InfoModel.__super__.initialize.apply( this, arguments );
            },

            setData: function( data ) {
                for (var key in data ) {
                    if ( data[key] !== '' ) {
                        this.set( key, data[key] );
                    }
                    else { // assignment for empty properties
                        if ( data[key] === 'date' ) {
                            this.set( 'date', (new Date()).toString() ); 
                        }
                    }
                }
            }

        });

    return InfoModel;
});