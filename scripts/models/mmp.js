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
                xml: '<?xml version="1.0" encoding="UTF-8"?><mentalModeler><info><id></id><name></name><version></version><date></date><author></author></info><concepts></concepts><scenarios></scenarios></mentalModeler>',
                xmlDoc: null,
                justAdded: false
            },

            infoModel: null,
            conceptCollection: null,
            scenarioCollection: null,

            initialize: function ( options ) {
                MmpModel.__super__.initialize.apply( this, arguments );
                this.infoModel = new InfoModel();
                this.conceptCollection = new Backbone.Collection( [], {model: ConceptModel} );                
                this.scenarioCollection = new Backbone.Collection( [], {model: ScenarioModel} );
                
                //this.setXML();
                var xml = this.get('xml');
                if ( xml !== '' ) {
                    this.xmlDoc = $.parseXML( xml );
                    this.conceptCollection.reset();
                    //this.scenarioCollection.reset();
                    this.parseXML( xml ); 
                    Backbone.trigger( 'mmp:change' );
                }

                // for scenarios added after model and view is first created
                this.listenTo( this.scenarioCollection, 'add', this.onScenarioAdded );
            },

            /*
             * update the model data from modelling section changes. this excludes updating
             * the info model or explicitly updating the scenarios
             */
            updateFromModelSection: function( modelXML ) {
                /*
                console.log('MmpModel > updateFromModelSection'); //, modelXML',modelXML );
                this.conceptCollection.reset();
                var $xml = this.prepXML( modelXML );
                var $concepts = $xml.find( '> concepts');
                var $concept = $concepts.find( 'concept' );
                this.setConcepts( $concept );

                // replace the concepts xml
                var s = $('<div></div>').append( $concepts ).html();
                s = s.replace(/(\r\n|\n|\r)/gm,'');
                console.log('   s:',s );
                //console.log('   $concepts[0]:',$concepts[0] );
                var xml = this.get('xml');
                console.log('xml:',xml);
                */

                // this is still doing it the old way
                this.set('xml', modelXML);
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
             * sets xml string. should only get called when new model is created
             */ 
            setXML: function() {
                var xml = this.get('xml');
                if ( xml !== '' ) {
                    this.conceptCollection.reset();
                    //this.scenarioCollection.reset();
                    this.parseXML( xml ); 
                    Backbone.trigger( 'mmp:change' );
                }
            },
            
            /*
             * builds the concepts collection from the concepts xml
             */             
            setConcepts: function( $concepts ) {
                //console.log( 'MmpModel > setConcepts');
                var that = this;
                $concepts.each( function( index, elem) {
                    that.conceptCollection.add( {xml: elem} );
                    //console.log('elem:',elem)
                });
                //console.log('     this.conceptCollection:',this.conceptCollection );
            },

            /*
             * parse xml string
             */ 
            parseXML: function( xml ) {
                // TODO, parse as xml, not html

                var that = this;
                // jquery xml object filtering
                var $xml = this.prepXML( xml );
                // info
                this.infoModel.setXML( $xml.find( '> info')[0] )
                // concepts
                this.setConcepts( $xml.find( '> concepts concept') );
                // scenarios
                var $scenarios = $xml.find( '> scenarios scenario');
                if ( $scenarios.length > 0 ) {
                    this.scenarioCollection.reset();
                    $scenarios.each( function( index, elem) {
                        that.addScenario( elem )
                    });
                }
                
                // stubbing out beginning of xml parsing
                /*
                var childNodes = this.xmlDoc.childNodes[0].childNodes;
                for (var i=0; i<childNodes.length; i++ ) {
                    var node = childNodes[i];
                    switch ( node.nodeName ) {
                        case 'info':
                            break;
                        case 'concepts':
                            break;
                        case 'scenarios':
                            break;        
                    }
                }
                */
            },

            prepXML: function( xml ) {
                // remove carraige returns and new lines
                xml = xml.replace(/(\r\n|\n|\r)/gm,'');
                // remove CDATA tags
                xml = xml.replace(/<!\[CDATA\[|\]\]>/gm,'');
                //remove header
                xml = xml.split('?>')[1];
            
                return $(xml);
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