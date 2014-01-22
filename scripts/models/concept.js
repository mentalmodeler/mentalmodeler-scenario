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

            toJSON:function () {
                var json = ConceptModel.__super__.toJSON.apply( this, arguments );
                json.relationships = this.relationshipCollection.toJSON();
                return json;
                //console.log( 'toJSON > json:',json ); 
            },

            setXML: function( xml ) {
                //console.log( 'ConceptModel > setXML, xml:',xml);
                
                // if not passed a string, use model property
                if (typeof xml === 'undefined') {
                    xml = this.get( 'xml' );
                }

                if ( xml && xml !== '' ) {
                    this.set( 'xml', xml );
                    this.parseXML( xml ); 
                }
            },

            /*
             * parse xml string
             */ 
            parseXML: function( xml ) {
                var that = this;
                
                this.relationshipCollection.reset();

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
                    console.log( 'elem:',elem)
                    that.relationshipCollection.add( {xml: elem} );
                });

                console.log( 'this.toJSON():',this.toJSON() );
            },
        });

    return ConceptModel;
});