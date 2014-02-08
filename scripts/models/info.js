/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract',
    'util/xmlUtils'

], function ( $, _, Backbone, AbstractModel, XML ) {
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

            close: function() {},

            setData: function( data ) {
                console.log('InfoModel > setData, data:',data);
                for (var key in data ) {
                    if ( data[key] !== '' ) {
                        this.set( key, data[key] );
                    }
                    else { // assignment for empty properties
                        if ( key === 'date' ) {
                            this.set( 'date', (new Date()).toString() ); 
                        }
                        else if ( key === 'version' ) {
                            this.set( 'version', window.mentalmodeler.appModel.version ); 
                        }
                    }
                }
            },

            toXML: function() {
                return XML.elementNL( 'info', XML.elementsFromJSON(this.attributes, [], true) )
            }
        });

    return InfoModel;
});