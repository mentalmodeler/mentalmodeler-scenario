/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract',
    'models/info',
    'models/concept',
    'models/scenario',
    'util/xmlUtils'

], function ( $, _, Backbone, AbstractModel, InfoModel, ConceptModel, ScenarioModel, XMLUtils ) {
    'use strict';

    var MmpModel = AbstractModel.extend({
            defaults: {
                xml: '<?xml version="1.0" encoding="UTF-8"?><mentalModeler><info><id></id><name></name><version></version><date></date><author></author></info><concepts></concepts><scenarios></scenarios></mentalModeler>',
                xmlDoc: null,
                justAdded: false
            },

            infoModel: null,
            conceptCollection: null,
            scenarioCollection: null,
            scenarioIndex: 0,
            doLog: false,

            initialize: function () {
                MmpModel.__super__.initialize.apply( this, arguments );
                
                this.infoModel = new InfoModel();
                this.conceptCollection = new Backbone.Collection( [], {model: ConceptModel} );                
                this.scenarioCollection = new Backbone.Collection( [], {model: ScenarioModel} );
                
                this.setData( XMLUtils.parseMmpFile( this.get('xml') ) );
                Backbone.trigger( 'mmp:change' );
                
                // for scenarios added after model and view is first created
                this.listenTo( this.scenarioCollection, 'add', this.onScenarioAdded );
            },

            close: function() {
                this.log('MmpModel > close');
                
                // destroy the view
                if ( this.getView() ) {
                    this.getView().close();
                }

                // destroy all the scenario models and delete collection
                this.scenarioCollection.each( function( scenario ) {
                    scenario.close();
                });
                this.scenarioCollection.reset();
                this.scenarioCollection = null;

                // destroy concept collection
                this.conceptCollection.reset();                
                this.conceptCollection = null;
                
                // destroy info model
                 this.infoModel.close(); 
                this.infoModel = null;
            },

            /*
             * update the model data from modelling section changes. this excludes updating
             * the info model or explicitly updating the scenarios
             */
            updateFromModelSection: function( modelXML ) {
                // updates the concepts collection
                var concepts = XMLUtils.parseMmpFile( modelXML, ['info', 'scenario'] ).concepts;
                this.conceptCollection.reset( concepts );

                // updates the concepts node in the xml and sets the xml
                var xml = XMLUtils.replaceConceptsNode( modelXML, this.get('xml') );
                this.set('xml', xml);
            },

            /*
             * adds a new scenario
             */
            addScenario: function( data ) {
                if (typeof data === 'undefined') {
                    data = {};
                }
                data.sourceConceptCollection = this.conceptCollection;
                this.scenarioCollection.add( data );
                Backbone.trigger( 'scenario:add' );
            },

            onScenarioAdded: function() {
                //console.log('onScenarioAdded, this.scenarioCollection:',this.scenarioCollection );
                this.getView().onScenariosChange();
            },

            /*
             * set data model with JSON values
             */ 
            setData: function( data ) {
                if ( typeof data === 'undefined' ) {
                    return false;
                }

                var that = this;
                if (typeof data.info !== 'undefined') {
                    this.infoModel.setData( data.info );
                }
                if (typeof data.concepts !== 'undefined') {
                    _.each( data.concepts, function( concept ) {
                        that.conceptCollection.add( concept )
                    });
                }
                if ( data.hasOwnProperty('scenarios') && data.scenarios.length > 0 ) {
                    this.scenarioCollection.reset();
                    _.each( data.scenarios, function( scenario ) {
                         that.addScenario( scenario );
                    });
                }
                else {
                    // add one scenario so the module has at least one scenario
                    that.addScenario();
                }
            },

            /*
             * gets xml string
             */ 
            getModelingXML: function() {
                var xml = XMLUtils.header + XMLUtils.elementNL( 'mentalmodeler', this.getConceptsXML() );
                return xml;
            },

            getXML: function() {
                var nodes = [ XMLUtils.JOIN_STR, this.infoModel.toXML(), this.getConceptsXML(), this.getScenariosXML() ];
                var xml = XMLUtils.header + XMLUtils.JOIN_STR + XMLUtils.elementNL( 'mentalmodeler', nodes.join('') );
                this.set( 'xml', xml );
                //console.log('getXML, xml:',xml);
                return xml;
            },

            /**
             * returns concepts xml section as a string
             */
            getConceptsXML:function() {
                var concepts = [ XMLUtils.JOIN_STR ];
                this.conceptCollection.each( function( concept ) {
                    concepts.push( concept.toXML() );
                });
                return XMLUtils.elementNL( 'concepts', concepts.join('') );
            },

            getScenariosXML:function() {
                var scenarios = [ XMLUtils.JOIN_STR ];
                this.scenarioCollection.each( function( scenario ) {
                    scenarios.push( scenario.toXML() );
                });
                return XMLUtils.elementNL( 'scenarios', scenarios.join( '') );
            },


            /**
             * returns object with model info
             */
            getInfo:function () {
                return this.infoModel.toJSON();
            },

            /**
             * returns array of concepts for the grid view
             */
            getConceptsForGrid: function() {
                return this.conceptCollection.toJSON( 'grid' );
            },

            /**
             * returns array of concepts for the scenario view table
             */
            getConceptsForScenario: function() {
                return this.conceptCollection.toJSON( 'grid' );
            },

            /**
             * returns an object for scenario calculation containing 3 parallel arrays:
             * 1. 1d array of concept models - called concepts
             * 2. 2d array of influencing values per concept - called influences
             * 3. 1d array of clamp values per concept for said scenario - called clamps
             */
            getDataForScenarioCalculation: function() {
                var appModel = window.mentalmodeler.appModel;
                var concepts = [];
                var influences = [];
                var clamps = [];
                var scenarioConceptCollection = null;
                
                if ( appModel.curSelection instanceof ScenarioModel ) {
                    scenarioConceptCollection = appModel.curSelection.conceptCollection;
                }

                this.conceptCollection.each( function( concept ) {
                    influences.push( concept.getInfluences() );
                    
                    if ( scenarioConceptCollection !== null ) {
                        var scenarioConcept = scenarioConceptCollection.findWhere( { id: concept.get('id') });
                        if (typeof scenarioConcept !== 'undefined' && scenarioConcept !== null) {
                            concepts.push( scenarioConcept );
                            clamps.push( appModel.getInfluenceValue( scenarioConcept.get('influence') ) );    
                        }
                        else {
                            clamps.push( appModel.getInfluenceValue( '' ) );    
                        }
                    }
                });

                return { concepts:concepts, influences:influences, clamps: clamps };

            }
        });

    return MmpModel;
});