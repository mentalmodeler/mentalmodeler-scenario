/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract',
    'models/info',
    'models/group',
    'models/concept',
    'models/scenario',
    'util/xmlUtils'

], function ( $, _, Backbone, AbstractModel, InfoModel, GroupModel, ConceptModel, ScenarioModel, XMLUtils ) {
    'use strict';

    var MmpModel = AbstractModel.extend({
            defaults: {
                xml: '<?xml version="1.0" encoding="UTF-8"?><mentalModeler><info><id></id><name></name><version></version><date></date><author></author></info><concepts></concepts><scenarios></scenarios></mentalModeler>',
                xmlDoc: null,
                justAdded: false,
                filename:'project.mmp'
            },

            infoModel: null,
            groupModel: null,
            conceptCollection: null,
            scenarioCollection: null,
            scenarioIndex: 0,
            x2js: null,
            doLog: false,
            logPrefix: '======== MmpModel > ',

            initialize: function( options ) {

                //console.log('mmp options:',options);
                MmpModel.__super__.initialize.apply( this, arguments );

                this.infoModel = new InfoModel();
                this.groupModel = new GroupModel();
                this.conceptCollection = new Backbone.Collection( [], {model: ConceptModel} );
                this.scenarioCollection = new Backbone.Collection( [], {model: ScenarioModel} );

                this.parseXML( this.get('xml') );

                this.setData( XMLUtils.parseMmpFile( this.get('xml') ) );
                Backbone.trigger( 'mmp:change' );

                // for scenarios added after model and view is first created
                this.listenTo( this.scenarioCollection, 'add', this.onScenarioAdded );
            },

            parseXML: function(xml) {
                //console.log( 'this.x2js:,',this.x2js,', parseXML, xml:',xml );
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
                if (typeof data.groupNames !== 'undefined') {
                   this.groupModel.setData( data.groupNames );
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
                //var xml = XMLUtils.header + XMLUtils.elementNL( 'mentalmodeler', this.getConceptsXML() );
                var nodes = [ XMLUtils.JOIN_STR, this.groupModel.toXML(), this.getConceptsXML() ];
                var xml = XMLUtils.header + XMLUtils.JOIN_STR + XMLUtils.elementNL( 'mentalmodeler', nodes.join('') );
                return xml;
            },

            getXML: function() {
                var nodes = [ XMLUtils.JOIN_STR, this.infoModel.toXML(), this.groupModel.toXML(), this.getConceptsXML(), this.getScenariosXML() ];
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

            getStructuralMetrics: function() {
                // 1. Number of Concepts   Sum total number of unique concepts in matrix   7
                // 2. Number of Connections    Sum total number of connections in matrix   11
                // 3. Density  The sum of the connections in the matrix divided by the total number of connections possible    0.2244897959
                // 4. Number of Connections/Components     Sum total number of connections divided by sum total number of componnets   1.571428571

                // *the following metrics require calculating and using the (a) INDEGEE and (b) OUTDEGREE
                // Indegree    Absolute value of the summed degree of influence for each column    every component will have one indegree value
                // Outdegree   Absolute value of the summed degree of influence for each row   every component will have one outdegree value

                // 5. Number of Driver Components  Number of components that meet the criteria: indegree = 0 and outdegree = positive value    1
                // 6. Number of Receiver Components    Number of components that meet the criteria: indegree = positive value and outdegree = 0    0
                // 7. Number of Ordinary   Number of components with a non-zero indegree and non-zero outdegree    6
                // 8. Complexity Score Number of Reciever Variables divided by Number of Driver Variables  0
                // 9. Highest Centrality Variables     Components with the highest values: sum indegree + outdegree    In this simple model, (1) manipulative fishing (2) stocks of valuable fish (3) roach fish (4) excessive vegetation and (5) water level all have a centrality of 3 and (6) stocking and (7) algal blooms are "less important" by the centrality measure with a value of 1.
                // 10. Most significant driving variables  Driver components with the largest outegree values  Since algal blooms are the only driving variable, it is the mist signficant driving variable. However, these can be ranked for larger models by ranking them by outdegree values
                // 11. Most significant receiving variables    Receiver componnets with the largest indegree values    There are not reciever variables in this model. However, these can be ranked for larger models by ranking them by indegree values
                var numComponents = this.conceptCollection.length;
                var numConnections = this.getNumberOfConnections();
                var numDrivers = 0;
                var numReceivers = 0;
                var numOrdinary = 0;
                var concepts = [];
                this.conceptCollection.each( function(concept) {
                    var type = concept.getType();
                    var indegree = concept.getIndegree();
                    var outdegree = concept.getOutdegree();
                    switch ( type ) {
                    case 'ordinary':
                        numOrdinary++;
                        break;
                    case 'driver':
                        numDrivers++;
                        break;
                    case 'receiver':
                        numReceivers++
                        break;
                    }
                    concepts.push({
                        name:           concept.get('name'),
                        type:           type,
                        indegree:       indegree,
                        outdegree:      outdegree,
                        centrality:     indegree + outdegree,
                        id:             concept.get('id'),
                        preferredState: concept.get('preferredState')
                    });
                });
                var o = {
                    numComs: numComponents,
                    numCons: numConnections,
                    density: numConnections / this.getPossibleNumberOfConnections(),
                    consPerComs: numConnections / numComponents,
                    numDrivers: numDrivers,
                    numReceivers: numReceivers,
                    numOrdinary: numOrdinary,
                    complexityScore: numReceivers / numDrivers,
                    concepts: concepts
                };
                return o;
            },

            getNumberOfConnections:function() {
                var num = 0;
                this.conceptCollection.each( function(concept) {
                    num += concept.relationshipCollection ? concept.relationshipCollection.length: 0;
                });
                return num;
            },

            getPossibleNumberOfConnections:function() {
                var l = this.conceptCollection.length;
                return this.conceptCollection ? l * (l - 1) : 0;
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