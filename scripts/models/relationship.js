/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract'

], function ( $, _, Backbone, AbstractModel ) {
    'use strict';

    var RelationshipModel = AbstractModel.extend({
            defaults: {
                id: '',
                name: '',
                notes: '',
                confidence: '',
                influence: ''
            },
            
            initialize: function ( options ) {
                RelationshipModel.__super__.initialize.apply( this, arguments );
                
                if ( typeof options !== 'undefined' ) {
                    this.setData( options );
                }
            },
            
            setData: function( data ) {
                for (var key in data ) {
                    if ( data[key] !== '' ) {
                        this.set( key, data[key] );
                    }
                }
            }
        });

    return RelationshipModel;
});