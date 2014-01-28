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
            
            initialize: function ( options ) {
                ScenarioConceptModel.__super__.initialize.apply( this, arguments );
                if ( /*typeof options.conceptReference !== 'undefined'  && */typeof options.conceptModel !== 'undefined' ) {
                    //this.conceptReference = options.conceptReference;
                    this.setData( options.conceptModel );    
                }
                else {
                    console.log( 'ERROR >> ScenarioConcpetModel >> no source concept reference -or- concept data provided')
                }
            },

            setData: function( data ) {
                // properties unique to the ScenarioConceptModel
                for (var key in data ) {
                    if ( data[key] !== '' ) {
                        this.set( key, data[key] );
                    }
                }
            }

        });

    return ScenarioConceptModel;
});