/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract',
    'models/relationship'

], function ( $, _, Backbone, AbstractModel, RelationshipModel ) {
    'use strict';

    var ConceptModel = AbstractModel.extend({
            defaults: {
                id: '',
                name: '',
                notes: '',
                x: '',
                y: '',
                units: '',
               
                // for scenario use
                selected: '',
                influence: ''
            },

            relationshipCollection: null,

            initialize: function ( options ) {
                ConceptModel.__super__.initialize.apply( this, arguments );
                this.relationshipCollection = new Backbone.Collection( [], {model: RelationshipModel} );
                
                if ( typeof options !== 'undefined' && typeof options.data !== 'undefined' ) {
                    this.setData( options.data );
                }
            },

            toJSON:function ( forView ) {
                var json = ConceptModel.__super__.toJSON.apply( this, arguments );
                switch ( forView ) {
                    case 'grid':
                        json.relationships = this.getRelationshipsByIdHash();
                        break;
                    default:
                        json.relationships = this.relationshipCollection.toJSON();
                }
                return json;
                //console.log( 'toJSON > json:',json ); 
            },

            getRelationshipsByIdHash:function() {
                var relationships = this.relationshipCollection.toJSON();
                var o = {};
                for (var i=0; i<relationships.length; i++) {
                    var r = relationships[i];
                    o[r.id] = r.influence;
                }
                return o;
            },
            
            setData: function( data ) {
                var that = this;
                for (var key in data ) {
                    if ( key === 'relationships' ) { // assignment for relationships
                        _.each( data.relationships, function( relationship ) {
                            that.relationshipCollection.add( {data: relationship} )
                        });
                    }
                    else if ( data[key] !== '' ) {
                        this.set( key, data[key] );
                    }
                }
            }

        });

    return ConceptModel;
});