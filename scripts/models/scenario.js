/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract',
    'models/concept',
    'models/scenarioConcept'

], function ( $, _, Backbone, AbstractModel, ConceptModel, ScenarioConceptModel ) {
    'use strict';

    var ScenarioModel = AbstractModel.extend({
            defaults: {
                xml: '',
                name: 'New Scenario'
            },

            conceptCollection: null,
            conceptsSourceCollection: null,
            
            initialize: function ( options ) {
                ScenarioModel.__super__.initialize.apply( this, arguments );
                this.conceptCollection = new Backbone.Collection( [], {model: ScenarioConceptModel} );
                
                if (typeof options.sourceCollection !== 'undefined') {
                    this.conceptsSourceCollection = options.sourceCollection;
                    //console.log('this.conceptsSourceCollection:',this.conceptsSourceCollection);
                    this.setXML();    
                }
                else {
                    console.log( 'ERROR >> ScenarioModel >> no concept source collection provided')
                }
            },

            setXML: function( xml ) {
                // if not passed a string, use model property
                if (typeof xml === 'undefined') {
                    xml = this.get( 'xml' );
                }
                if ( xml && xml !== '' ) {
                    this.set( 'xml', xml );
                    this.conceptCollection.reset();
                    this.parseXML( xml ); 
                }
                else {
                    // create new scenario data from
                }
            },

            /*
             * parse xml string
             */ 
            parseXML: function( xml ) {
                //console.log('ScenarioModel > parseXML, xml:',xml);
                var that = this;
                
                // jquery xml object filtering
                var $xml = $(xml);
                this.set( 'name', $xml.children('name').text() );
                
                // concepts
                $xml.find( '> concepts concept').each( function( index, elem) {
                    that.conceptCollection.add( {xml: elem, scenario:that } );
                });
            },
        });

    return ScenarioModel;
});