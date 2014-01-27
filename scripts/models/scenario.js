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
                    this.setXML();    
                }
                else {
                    console.log( 'ERROR >> ScenarioModel >> no concept source collection provided')
                }
            },

            getConceptsForScenario: function() {
                return this.conceptCollection.toJSON();
            },

            updateCollection: function() {
                console.log('updateCollection, this.conceptsSourceCollection:',this.conceptsSourceCollection);
                this.removeConcepts();
                this.addConcepts();
            },

            /*
             * remove concepts that aren't in source collection but are in concept collection
             */ 
            removeConcepts: function() {
                //console.log('removeConcepts, this.conceptCollection:',this.conceptCollection,', this.conceptsSourceCollection:',this.conceptsSourceCollection);
                var that = this;
                this.conceptCollection.each( function( scenarioConceptModel ) {
                    var id = scenarioConceptModel.get('id');
                    if ( typeof that.conceptsSourceCollection.findWhere( {id: id} ) === "undefined" ) {
                        console.log('     removing scenario concept, id:',id);
                        that.conceptCollection.remove( scenarioConceptModel );
                    }
                });
            },
            /*
             * add concepts that are in source collection but not in concept collection
             */
            addConcepts: function() {
                //console.log('addConcepts, this.conceptCollection:',this.conceptCollection,', this.conceptsSourceCollection:',this.conceptsSourceCollection);
                var that = this;
                this.conceptsSourceCollection.each( function( conceptModel ) {
                    var id = conceptModel.get('id');
                    if ( typeof that.conceptCollection.findWhere( {id: id} ) === "undefined" ) {
                        console.log('     adding scenario concept, id:',id);
                        that.conceptCollection.add()
                    }
                });
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

                // aggregate concepts 
                this.updateCollection();
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
                    var id = $(elem).children('id').text();
                    var conceptReference = that.conceptsSourceCollection.findWhere( {id: id} );
                    // if we found a source concept with an id matching the scenario concept, we are good to go
                    if ( typeof conceptReference !== 'undefined' ) {
                        that.conceptCollection.add( {xml: elem, conceptReference: conceptReference} );
                    }
                });
            }
        });

    return ScenarioModel;
});