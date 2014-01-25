/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract',
    'models/relationship'

], function ( $, _, Backbone, AbstractModel, RelationshipModel ) {
    'use strict';

    var ScenarioConceptModel = AbstractModel.extend({
            defaults: {
                xml: '',
                id: '',
                selected: '',
                influence: '',
                name: ''
            },

            concept: null,
            scenario: null,

            initialize: function ( options ) {
                ScenarioConceptModel.__super__.initialize.apply( this, arguments );
                if (typeof options.scenario !== 'undefined') {
                    this.scenario = options.scenario;
                    //console.log ( 'this.scenario:',this.scenario );
                    this.setXML();    
                }
                else {
                    console.log( 'ERROR >> ScenarioConcpetModel >> no scenario provided')
                }
            },

            toJSON:function () {
                return ScenarioConceptModel.__super__.toJSON.apply( this, arguments );
            },

            setXML: function( xml ) {
                // if not passed a string, use model property
                if (typeof xml === 'undefined') {
                    xml = this.get( 'xml' );
                }

                if ( xml && xml !== '' ) {
                    this.set( 'xml', xml );
                    this.parseXML( xml ); 
                }
            },

            /*
             * parse xml string
             */ 
            parseXML: function( xml ) {
                var that = this;
                
                // jquery xml object filtering
                var $xml = $(xml);
                this.set( 'id', $xml.children('id').text() );
                this.set( 'name', $xml.children('name').text() );
                this.set( 'selected', $xml.children('selected').text() );
                this.set( 'influence', $xml.children('influence').text() );
                
                // get ref to concept
                var collection = this.scenario.conceptsSourceCollection;
                this.concept = collection.findWhere( { id: this.get('id') } );
            },
        });

    return ScenarioConceptModel;
});