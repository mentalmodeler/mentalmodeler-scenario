/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract',
    'models/info',
    'models/concept',
    'models/scenario'

], function ( $, _, Backbone, AbstractModel, InfoModel, ConceptModel, ScenarioModel ) {
    'use strict';

    var MmpModel = AbstractModel.extend({
            defaults: {
                xml: '',
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
                this.setXML();

                // for scenarios added after model and view is first created
                this.listenTo( this.scenarioCollection, 'add', this.onScenarioAdded );
            },

            /*
             * adds a new scenario
             */
            addScenario: function( xml ) {
                if ( typeof xml === 'undefined' ) {
                    xml = '';
                }
                this.scenarioCollection.add( {xml: xml, sourceCollection:this.conceptCollection } );
            },

            onScenarioAdded: function() {
                //console.log('onScenarioAdded, this.scenarioCollection:',this.scenarioCollection );
                this.getView().onScenariosChange();
            },

            /*
             * sets xml string
             */ 
            setXML: function( xml ) {
                //console.log( 'MmpModel > setXML, xml:',xml)
                
                // if not passed a string, use model property
                if (typeof xml === 'undefined') {
                    xml = this.get( 'xml' );
                }

                if ( xml && xml !== '' ) {
                    this.set( 'xml', xml );
                    this.conceptCollection.reset();
                    //this.scenarioCollection.reset();
                    this.parseXML( xml ); 
                    Backbone.trigger( 'mmp:change' );
                }
                else {
                    this.$xml = $('')
                }   
            },

            /*
             * parse xml string
             */ 
            parseXML: function( xml ) {
                var that = this;
                
                // remove carraige returns and new lines
                xml = xml.replace(/(\r\n|\n|\r)/gm,'');
                // remove CDATA tags
                xml = xml.replace(/<!\[CDATA\[|\]\]>/gm,'');
                //remove header
                xml = xml.split('?>')[1];
                
                // jquery xml object filtering
                var $xml = $(xml);
                this.$xml = $(xml);
                
                // info
                this.infoModel.setXML( $xml.find( '> info')[0] )
                // concepts
                $xml.find( '> concepts concept').each( function( index, elem) {
                    that.conceptCollection.add( {xml: elem} );
                });
                // scenarios
                var $scenarios = $xml.find( '> scenarios scenario');
                if ( $scenarios.length > 0 ) {
                    this.scenarioCollection.reset();
                    $scenarios.each( function( index, elem) {
                        that.addScenario( elem )
                    });
                }
                /*
                $xml.find( '> scenarios scenario').each( function( index, elem) {
                    that.addScenario( elem )
                });
                */
            },

            /*
             * gets xml string
             */ 
            getXML: function() {
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
             * returns array of concepts for the grid view
             */
            getConceptsForScenario: function() {
                return this.conceptCollection.toJSON( 'grid' );
            },

            /**
             * returns array of concepts for the grid view
             */
            getConcepts: function() {
                return this.conceptCollection.toJSON( 'grid' );
            }
        });

    return MmpModel;
});