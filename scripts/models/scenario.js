/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract',
    'models/concept',
    'models/scenarioConcept',
    'util/dataUtils',
    'util/xmlUtils'

], function ( $, _, Backbone, AbstractModel, ConceptModel, ScenarioConceptModel, DataUtils, XML ) {
    'use strict';

    var ScenarioModel = AbstractModel.extend({
            defaults: {
                xml: '',
                name: 'Scenario'
            },

            conceptCollection: null,
            sourceConceptCollection: null, // reference to mmp model concept collection
            doLog: false,
            logPrefix: '', // ===== ScenarioModel > ',
            
            initialize: function ( options ) {
                ScenarioModel.__super__.initialize.apply( this, arguments );
                this.conceptCollection = new Backbone.Collection( [], {model: ScenarioConceptModel} );
                
                if ( typeof options !== 'undefined') {
                    this.setData( options );
                }
                else {
                    this.log( 'ERROR >> ScenarioModel >> no scenario data provided')
                }
            },

            close: function() {
                this.log('ScenarioModel > close');
                this.conceptCollection.reset();
                this.conceptCollection = null;

                this.sourceConceptCollection = null;
            },

            getConceptsForScenario: function() {
                this.updateCollection();
                return this.conceptCollection.toJSON();
            },

            updateCollection: function() {
                // pass the previous collection to addConcepts so that selected/influence values for models
                // can be passed on to new version of saae model
                var prevCollection = this.conceptCollection.clone();
                //this.log('+++++++ ScenarioModel > updateCollection, this.conceptCollection:',this.conceptCollection,', prevCollection',prevCollection );
                this.addConcepts( prevCollection );
            },
            
            /*
             * update scenario concept collection based on new concept models
             */
            addConcepts: function( prevCollection ) {
                this.log('======= ScenarioModel >> addConcepts, prevCollection:',prevCollection);
                //this.log('addConcepts, this.conceptCollection:',this.conceptCollection,', this.conceptsSourceCollection:',this.conceptsSourceCollection);
                var that = this;
                that.conceptCollection.reset();

                var appModel = window.mentalmodeler.appModel;
                if ( appModel.curModel !== null ) {
                    var conceptsSourceCollection = appModel.curModel.conceptCollection;
                    // console.log('conceptsSourceCollection:', conceptsSourceCollection);
                    //this.conceptsSourceCollection.each( function( conceptModel ) {
                    //console.log('      appModel.curModel:',appModel.curModel);//conceptsSourceCollection:',conceptsSourceCollection );
                    this.sourceConceptCollection.each( function( conceptModel ) {
                        var id = conceptModel.get('id');
                        var conceptRefProps =  { id: id, name: conceptModel.get('name'), preferredState: conceptModel.get('preferredState')};
                        var prevModel = prevCollection.findWhere( {id: id} );
                        if ( typeof prevModel !== 'undefined' ) {
                            conceptRefProps.selected = prevModel.get('selected');
                            conceptRefProps.influence = prevModel.get('influence');
                            that.log('     modifying scenario concept, conceptRefProps:',conceptRefProps);
                        } else {
                            that.log('     adding scenario concept, conceptRefProps:',conceptRefProps);
                        }

                        that.conceptCollection.add( { conceptRefProps: conceptRefProps } );
                    });
                }
                this.log('     newCollection:', that.conceptCollection);
            },

            setData: function( data ) {
                //this.log('setData');
                var that = this;
                this.conceptCollection.reset();
                for (var key in data ) {
                    if ( key === 'sourceConceptCollection' ) { // concpets source collection
                        this.sourceConceptCollection = data[key]
                        this.log('==== ScenarioModel > this.sourceConceptCollection:',this.sourceConceptCollection  );
                    }
                    else if ( key === 'concepts' ) { // assignment for concepts
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
            },

            toXML:function() { 
                var concepts = [ XML.JOIN_STR ];
                this.conceptCollection.each( function( concept ) {
                    concepts.push( concept.toXML() );
                });
                var nodes = [ XML.JOIN_STR, XML.elementNL( 'name', this.get('name'), true ) ];
                nodes.push( XML.elementNL( 'concepts', concepts.join('') ) );
                return XML.elementNL( 'scenario', nodes.join( '' ) );
            }

        });

    return ScenarioModel;
});