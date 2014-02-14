/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract',
    'util/xmlUtils'

], function ( $, _, Backbone, AbstractModel, XML ) {
    'use strict';

    var ScenarioConceptModel = AbstractModel.extend({
            defaults: {
                selected: true,
                influence: '',
                id: '',
                name: ''
            },

            conceptReference: null,
            doLog: false,
            
            initialize: function ( options ) {
                ScenarioConceptModel.__super__.initialize.apply( this, arguments );
                if ( typeof options.conceptRefProps !== 'undefined' ) {
                    this.setData( options.conceptRefProps );    
                }
                else {
                    console.log( 'ERROR >> ScenarioConceptModel >> no concept reference data provided')
                }
            },

            close: function() {
                this.log('ScenarioConceptModel > close');
            },

            setData: function( data ) {
                // properties unique to the ScenarioConceptModel
                //console.log('ScenarioConceptModel > setData');
                for (var key in data ) {
                    if ( data[key] !== '' ) {
                        if ( key === 'selected' ) {
                            if ( data[key] === true || data[key] === 'True' || data[key] === 'true')  {
                                this.set( key, true );    
                            }
                            else {
                                this.set( key, false );    
                            }
                        }
                        else {
                            this.set( key, data[key] );    
                        }
                    }
                }
            },

            toXML:function() {
                return XML.elementNL( 'concept', XML.elementsFromJSON(this.attributes, ['conceptRefProps'], true) )
            }

        });

    return ScenarioConceptModel;
});