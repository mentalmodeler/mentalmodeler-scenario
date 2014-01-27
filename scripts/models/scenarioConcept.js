/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract'

], function ( $, _, Backbone, AbstractModel ) {
    'use strict';

    var ScenarioConceptModel = AbstractModel.extend({
            defaults: {
                xml: '',
                selected: '',
                influence: '',
                id: '',
                name: ''
            },

            conceptReference: null,
            
            initialize: function ( options ) {
                ScenarioConceptModel.__super__.initialize.apply( this, arguments );
                if (typeof options.conceptReference !== 'undefined') {
                    this.conceptReference = options.conceptReference;
                    this.setXML();    
                }
                else {
                    console.log( 'ERROR >> ScenarioConcpetModel >> no source concept reference provided')
                }
            },

            toJSON:function () {
                var json = ScenarioConceptModel.__super__.toJSON.apply( this, arguments );
                var propsToDelete = ['xml', 'conceptReference'];
                for ( var i=0; i<propsToDelete.length; i++ ) {
                    delete json[ propsToDelete[i] ];
                }
                //console.log('scenario concept toJSON, json:',json);
                return json;
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
                
                // properties unique to the ScenarioConceptModel
                this.set( 'selected', $xml.children('selected').text() );
                this.set( 'influence', $xml.children('influence').text() );
                
                // properties acquired from the source reference ConceptModel
                this.set( 'id', this.conceptReference.get('id') );
                this.set( 'name', this.conceptReference.get('name') );
            },
        });

    return ScenarioConceptModel;
});