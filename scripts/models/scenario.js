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
                // pass the previous collection to addConcepts so that selected/influence values for models
                // can be passed on to new version of smae model
                var prevCollection = this.conceptCollection.clone();
                this.addConcepts( prevCollection );
            },
            
            /*
             * update scenario concept collection based on new concpet models
             */
            addConcepts: function( prevCollection ) {
                var log = false;
                if (log) { console.log('addConcepts, prevCollection:',prevCollection); }
                //console.log('addConcepts, this.conceptCollection:',this.conceptCollection,', this.conceptsSourceCollection:',this.conceptsSourceCollection);
                var that = this;
                that.conceptCollection.reset();
                this.conceptsSourceCollection.each( function( conceptModel ) {
                    var conceptRefProps =  { id: conceptModel.get('id'), name: conceptModel.get('name') };
                    var id = conceptModel.get('id');
                    var prevModel = prevCollection.findWhere( {id: id} );
                    if ( typeof prevModel !== 'undefined' ) {
                        conceptRefProps.selected = prevModel.get('selected');
                        conceptRefProps.influence = prevModel.get('influence');
                    }
                    if (log) { console.log('     adding scenario concept, conceptRefProps:',conceptRefProps); }
                    that.conceptCollection.add( { conceptRefProps: conceptRefProps } );
                });
                if (log) { console.log('     newCollection:', that.conceptCollection); }
            },

            setData: function( data ) {
                //console.log('setData');
                var that = this;
                this.conceptCollection.reset();
                for (var key in data ) {
                    if ( key === 'concepts' ) { // assignment for concepts
                        _.each( data[key], function( concept ) {
                            that.conceptCollection.add( { conceptRefProps: concept } );
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