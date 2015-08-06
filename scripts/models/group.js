/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract',
    'util/xmlUtils'

], function ( $, _, Backbone, AbstractModel, XML ) {
    'use strict';

    var GroupModel = AbstractModel.extend({
            defaults: {
            },

            doLog: true,
            logPrefix: '==*== GroupModel > ',

            initialize: function () {
                GroupModel.__super__.initialize.apply( this, arguments );
            },

            close: function() {},

            setData: function( data ) {
                //this.log('setData, data:',data);
                for (var key in data ) {
                    //if ( data[key] !== '' ) {
                        this.set( key, data[key] );
                    //}
                    /*
                    else { // assignment for empty properties
                        if ( key === 'date' ) {
                            this.set( 'date', (new Date()).toString() );
                        }
                        else if ( key === 'version' ) {
                            this.set( 'version', window.mentalmodeler.appModel.version );
                        }
                    }
                    */
                }
                //console.log('this.toJSON():',this.toJSON());
            },

            toXML: function() {
                return XML.elementNL( 'groupNames', XML.elementsFromJSON(this.attributes, [], true, {nodeName:'groupName', attr:'index'} ) );
            }
        });

    return GroupModel;
});