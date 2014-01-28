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
                if ( typeof options.conceptReference !== 'undefined'  && typeof options.data !== 'undefined' ) {
                    this.conceptReference = options.conceptReference;
                    this.setData( options.data );    
                }
                else {
                    console.log( 'ERROR >> ScenarioConcpetModel >> no source concept reference -or- concept data provided')
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

            setData: function( data ) {
                // properties unique to the ScenarioConceptModel
                for (var key in data ) {
                    if ( data[key] !== '' ) {
                        this.set( key, data[key] );
                    }
                }
                // properties acquired from the source reference ConceptModel
                this.set( 'name', this.conceptReference.get('name') );
                this.set( 'id', this.conceptReference.get('id') );

            }

        });

    return ScenarioConceptModel;
});