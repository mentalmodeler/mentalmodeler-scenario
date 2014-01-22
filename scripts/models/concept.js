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
                xml: '',
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

            relationshipCollection: new Backbone.Collection( [], {model: RelationshipModel} ),

            initialize: function () {
                ConceptModel.__super__.initialize.apply( this, arguments );
                this.setXML();
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

            setXML: function( xml ) {
                //console.log( 'ConceptModel > setXML, xml:',xml);
                
                // if not passed a string, use model property
                if (typeof xml === 'undefined') {
                    xml = this.get( 'xml' );
                }

                if ( xml && xml !== '' ) {
                    this.set( 'xml', xml );
                    this.relationshipCollection.reset();
                    this.relationshipCollection = new Backbone.Collection( [], {model: RelationshipModel} ),
                    this.parseXML( xml ); 
                }
            },

            /*
             * parse xml string
             */ 
            parseXML: function( xml ) {
                var that = this;
                
                // jquery xml object filtering
                var $xml = $(xml);
                this.set( 'id', $xml.children('id').text() );
                this.set( 'name', $xml.children('name').text() );
                this.set( 'notes', $xml.children('notes').text() );
                this.set( 'x', $xml.children('x').text() );
                this.set( 'y', $xml.children('y').text() );
                this.set( 'units', $xml.children('units').text() );

                // concepts
                $xml.find( '> relationships relationship').each( function( index, elem) {
                    that.relationshipCollection.add( {xml: elem} );
                });
            },
        });

    return ConceptModel;
});