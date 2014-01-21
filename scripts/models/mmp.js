/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract'

], function ( $, _, Backbone, AbstractModel ) {
    'use strict';

    var MmpModel = AbstractModel.extend({
            defaults: {
                xml: null,
                xmlString: '',
                json: null,
                jsonString: '',
                scenarios: '',
                justAdded: false
            },

            $components:null,

            initialize: function () {
                MmpModel.__super__.initialize.apply( this, arguments );
                var xmlString = this.get('xmlString');
                //console.log( 'MmpModel > initialize, xmlString:',xmlString); 
                this.setXMLString( xmlString );   
            },

            setXMLString: function( xmlString ) {
                //console.log( 'MmpModel > setXMLString, xmlString:',xmlString)
                if ( xmlString && xmlString !== '' ) {
                    this.set('xmlString', xmlString)
                    this.parseXML( xmlString );
                    Backbone.trigger( 'mmp:xmlStringChange' );
                }   
            },

            parseXML: function( xmlString ) {
                // remove carraige returns and new lines
                xmlString = xmlString.replace(/(\r\n|\n|\r)/gm,'');
                // remove CDATA tags
                xmlString = xmlString.replace(/<!\[CDATA\[|\]\]>/gm,'');
                xmlString = xmlString.split('?>')[1];
                //console.log('parseXML, xmlString:',xmlString );
                var $xml = $(xmlString);
                this.$components = $xml.find('> concepts > concept');
                //console.log('this.$components');
            },

            getComponents: function() {
                var a = [];
                if ( this.$components && this.$components.length > 0) {
                    this.$components.each( function(index, elem) {
                        a.push( elem )
                    });
                }
                return a;
            }
        });

    return MmpModel;
});