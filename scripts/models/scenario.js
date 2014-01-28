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
                
                if (typeof options.sourceCollection !== 'undefined' && typeof options.data !== 'undefined') {
                    this.conceptsSourceCollection = options.sourceCollection;
                    this.setData( options.data );    
                }
                else {
                    console.log( 'ERROR >> ScenarioModel >> no concept source collection -or- scenario data provided')
                }
            },

            getConceptsForScenario: function() {
                this.updateCollection();
                return this.conceptCollection.toJSON();
            },

            updateCollection: function() {
                var sc = this.conceptCollection.toJSON();
                console.log('BEFORE sc:',sc)
                //this.removeConcepts();
                this.addConcepts();
                console.log('AFTER sc:',sc)
                //console.log('updateCollection, this.conceptsSourceCollection:',this.conceptsSourceCollection);
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
                that.conceptCollection.reset();
                this.conceptsSourceCollection.each( function( conceptModel ) {
                    var id = conceptModel.get('id');
                    if ( typeof that.conceptCollection.findWhere( {id: id} ) === "undefined" ) {
                        console.log('     adding scenario concept, id:',id);
                        that.conceptCollection.add( { conceptModel: { id: conceptModel.get('id'), name: conceptModel.get('name') } } );
                    }
                });
            },

            setData: function( data ) {
                var that = this;
                this.conceptCollection.reset();
                for (var key in data ) {
                    if ( key === 'concepts' ) { // assignment for concepts
                        _.each( data.concepts, function( concept ) {
                            var conceptReference = that.conceptsSourceCollection.findWhere( {id: concept.id} );
                            // if we found a source concept with an id matching the scenario concept, we are good to go
                            if ( typeof conceptReference !== 'undefined' ) {
                               that.conceptCollection.add( {data: concept } );
                            }
                        });
                    }
                    else if ( data[key] !== '' ) {
                        this.set( key, data[key] );
                    }
                }

                // aggregate concepts 
                this.updateCollection();
            }

        });

    return ScenarioModel;
});