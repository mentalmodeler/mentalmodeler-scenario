/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract'

], function ( $, _, Backbone, AbstractModel ) {
    'use strict';

    var RelationshipModel = AbstractModel.extend({
            defaults: {
                xml: '',
                id: '',
                name: '',
                notes: '',
                confidence: '',
                influence: ''
            },
            
            initialize: function () {
                RelationshipModel.__super__.initialize.apply( this, arguments );
                this.setXML();
            },

            setXML: function( xml ) {
                //console.log( 'RelationshipModel > setXML, xml:',xml);
                
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
                this.set( 'notes', $xml.children('notes').text() );
                this.set( 'confidence', $xml.children('confidence').text() );
                this.set( 'influence', $xml.children('influence').text() );
            },
        });

    return RelationshipModel;
});