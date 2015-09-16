/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract',
    'models/relationship',
    'util/xmlUtils'

], function ( $, _, Backbone, AbstractModel, RelationshipModel, XML ) {
    'use strict';

    var ConceptModel = AbstractModel.extend({
            defaults: {
                id: '',
                name: '',
                notes: '',
                x: '',
                y: '',
                units: '',
                group: '',
                preferredState: 0,

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

            getOutdegree: function() {
                var outdegree = 0;
                this.relationshipCollection.each( function( relationship ) {
                    var s = relationship.get('influence');
                    var v = parseFloat( relationship.get('influence') );
                    outdegree += !isNaN( v ) ? Math.abs( v ): 0;
                });
                return outdegree;
            },

            getIndegree: function() {
                var indegree = this.getInfluences( true );
                return indegree;
            },

            getCentrality: function() {
                return this.getIndegree() + this.getOutdegree();
            },

            getType: function() {
                var indegree = this.getIndegree();
                var outdegree = this.getOutdegree();
                var type = 'none';
                if ( indegree !== 0 ) {
                    if ( outdegree !== 0 ) {
                        type = 'ordinary';
                    } else {
                        type = 'receiver';
                    }
                } else if ( outdegree !== 0 ) {
                    type = 'driver';
                }
                return type;
            },

            toJSON:function ( forView ) {
                var json = ConceptModel.__super__.toJSON.apply( this, arguments );
                switch ( forView ) {
                    case 'grid':
                        json.relationships = this.getRelationshipsByIdHash();
                        break;
                    case 'metrics':
                        json.indegree = this.getIndegree();
                        json.outdegree = this.getOutdegree();
                        json.centrality = this.getCentrality();
                        json.type = this.getType();
                    default:
                        json.relationships = this.relationshipCollection.toJSON();
                }
                //this.toXML();
                //console.log('ConceptModel > toJSON, json:',json);
                return json;
            },

            toXML: function() {
                var nodes = [];
                nodes.push( XML.elementsFromJSON( this.attributes, ['selected','influence','relationships'], true ) );
                var relationships = [ XML.JOIN_STR ];
                this.relationshipCollection.each( function( relationship ) {
                    relationships.push( relationship.toXML() );
                });
                nodes.push( XML.elementNL( 'relationships', relationships.join('') ) );
                return XML.elementNL( 'concept', nodes.join('') )
            },

            getInfluences: function( asOutdegree ) {
                var appModel = window.mentalmodeler.appModel;
                var influences = [];
                var outdegree = 0;
                var id = this.get('id');
                //console.log('ConceptModel >> getInfluences');
                this.collection.each( function( concept) {
                    var relationship = concept.relationshipCollection.findWhere( {id:id} );
                    //console.log( '     relationship:',relationship);
                    if ( typeof relationship !== 'undefined' && relationship && relationship.get('influence') != 'undefined' ) {
                        var influence = appModel.getInfluenceValue( relationship.get('influence') );
                        influences.push( influence );
                        outdegree += Math.abs( influence );
                    }
                    else {
                        influences.push( appModel.getInfluenceValue('') );
                    }
                });
                return asOutdegree ? outdegree : influences;
            },

            getRelationshipsByIdHash:function() {
                var relationships = this.relationshipCollection.toJSON();
                var o = {};
                //console.log('ConceptModel > ' + this.get('id') +' > getRelationshipsByIdHash, relationships:',relationships );
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
