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
                
                if ( typeof options !== 'undefined' ) {
                    this.setData( options );
                }
                else {
                    console.log( 'ERROR >> ConceptModel >> no concept data provided')
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
            },

            getInfluences: function() {
                var appModel = window.mentalmodeler.appModel;
                var influences = [];
                var id = this.get('id');
                this.collection.each( function( concept) {
                    var relationship = concept.relationshipCollection.findWhere( {id:id} );
                    if ( typeof relationship !== 'undefined' && relationship.get('influence') != 'undefined' ) {
                        influences.push( appModel.getInfluenceValue( relationship.get('influence') ) )
                    }
                    else {
                        influences.push( appModel.getInfluenceValue('') );
                    }
                });
                return influences;
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
                        _.each( data[key], function( relationship ) {
                            that.relationshipCollection.add( relationship );
                        });
                    }
                    else if ( data[key] !== '' ) {
                        this.set( key, data[key] );
                    }
                }
                delete this.data;
            }

        });

    return ConceptModel;
});