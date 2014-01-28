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
                this.scenarioCollection.add( {data: data, sourceCollection:this.conceptCollection } );
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
                        that.conceptCollection.add( {data: concept} )
                    });
                }
                if (typeof data.scenarios !== 'undefined' && data.scenarios.length > 0 ) {
                    this.scenarioCollection.reset();
                    _.each( data.scenarios, function( scenario ) {
                         that.addScenario( scenario )
                    });
                }
            },

            /*
             * gets xml string
             */ 
            getXML: function() {
                // eventually this .mmp xml should get generated from the info model,
                // conecpts collection, and scenario collection 
                return this.get('xml');
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
             * returns array of concepts for the scenario view
             */
            getConceptsForScenario: function() {
                return this.conceptCollection.toJSON( 'grid' );
            }
        });

    return MmpModel;
});