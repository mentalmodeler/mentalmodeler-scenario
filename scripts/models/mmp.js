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

            $components: null,
            $xml: $(''),

            infoModel: new InfoModel(),
            conceptCollection: new Backbone.Collection( [], {model: ConceptModel} ),
            scenarioCollection: new Backbone.Collection( [], {model: ScenarioModel} ),

            initialize: function () {
                MmpModel.__super__.initialize.apply( this, arguments );
                console.log( 'this.conceptCollection:', this.conceptCollection );
                this.setXML();
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
                    this.scenarioCollection.reset();
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
                
                console.log('reset')

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
                //scenario
                $xml.find( '> scenarios scenario').each( function( index, elem) {
                    that.scenarioCollection.add( {xml: elem} );
                });
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
            getConcepts: function() {
                return this.conceptCollection.toJSON();
            }
        });

    return MmpModel;
});