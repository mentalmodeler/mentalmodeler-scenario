/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract',
    'util/xmlUtils'

], function ( $, _, Backbone, AbstractModel, XML ) {
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
            },

            toXML:function() {
                return XML.elementNL( 'relationship', XML.elementsFromJSON( this.attributes, [], true ) );
            }
        });

    return RelationshipModel;
});