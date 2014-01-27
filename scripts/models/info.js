/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract'

], function ( $, _, Backbone, AbstractModel ) {
    'use strict';

    var InfoModel = AbstractModel.extend({
            defaults: {
                name: 'New Model',
                author: '',
                description: '',
                version: '',
                date: ''
            },

            xml: '',

            initialize: function () {
                InfoModel.__super__.initialize.apply( this, arguments );
            },

            setXML: function (xml) {
               // console.log( 'InfoModel > setXML, xml:',xml );

                if (typeof xml === 'undefined') {
                    xml = this.xml;
                }

                if ( xml && xml !== '' ) {
                    this.xml = xml;

                    var $xml = $(xml);
                    var $name = $xml.find('name');
                    if ( $name.length > 0 && $name.text() !== '' ) {
                        this.set( 'name', $name.text() );     
                    }
                    this.set( 'author', $xml.find('author').text() );
                    this.set( 'description', $xml.find('description').text() );
                    this.set( 'date', $xml.find('date').text() );
                    this.set( 'version', $xml.find('version').text() );
                }

                // console.log( 'this.toJSON():',this.toJSON() );   
            }
        });

    return InfoModel;
});