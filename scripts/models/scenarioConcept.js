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
                selected: 'true',
                influence: '',
                id: '',
                name: ''
            },

            conceptReference: null,
            doLog: true,
            
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
                for (var key in data ) {
                    if ( data[key] !== '' ) {
                        //console.log( '     data['+key+']:',data[key],', typeof data[key] is String:',typeof data[key] );
                        this.set( key, data[key] );
                    }
                }
            }

        });

    return ScenarioConceptModel;
});