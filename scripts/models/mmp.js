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

            $components: null,
            $xml: $(''),

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
                    
                    // create jquery object for selector filtering
                    // remove carraige returns and new lines
                    xmlString = xmlString.replace(/(\r\n|\n|\r)/gm,'');
                    // remove CDATA tags
                    xmlString = xmlString.replace(/<!\[CDATA\[|\]\]>/gm,'');
                    xmlString = xmlString.split('?>')[1];
                    this.$xml = $(xmlString);

                    Backbone.trigger( 'mmp:xmlStringChange' );
                }
                else {
                    this.$xml = $('')
                }   
            },

            /**
             * returns object with model info
             */
            getInfo:function () {
                var $info = this.$xml.find('info');
                return { name: $info.find('name').text(),
                         author: $info.find('author').text(),   
                         description: $info.find('description').text()
                };
            },

            /**
             * returns array of concepts for the grid view
             */
            getComponents: function() {
                var a = [];
                var $components = this.$xml.find( '> concepts concept')
                if ( $components && $components.length > 0) {
                    $components.each( function(index, elem) {
                        a.push( elem )
                    });
                }
                return a;
            }
        });

    return MmpModel;
});