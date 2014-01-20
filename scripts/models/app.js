/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract',
    'models/mmp',
    'views/mmp'

], function ( $, _, Backbone, AbstractModel, MmpModel, MmpView ) {
    'use strict';

    var AppModel = AbstractModel.extend({
            
            defaults: {
                mmps: [],
            },
            curModel: null,
            curSection: 'modeling',
            modelingView: null,
            gridView: null,
            scenarioView: null,
            infoView:null,

            initialize: function () {
                AppModel.__super__.initialize.apply( this, arguments );
                this.set( 'mmps', new Backbone.Collection([], {model: MmpModel}) );
                //console.log('AppModel > initialize, this.get(mmps):',this.get('mmps') );
            },

            addModel: function( xmlString ) {
                //console.log('AppModel > addMmpModel, xmlString:',xmlString);
                //console.log('    BEFORE    this.get(mmps):',this.get('mmps') ); 
                var mmps = this.get( 'mmps' );
                var mmp = new MmpModel( {xmlString:xmlString, justAdded:true } );
                this.curModel = mmp;
                var mmpView = new MmpView( {model:mmp} );
                mmps.add( mmp );
                this.set( 'mmps', mmps );
                Backbone.trigger( 'mmp:add', mmp );
            },

            selectionChange: function( model, target, section ) {
                if ( this.modelingView !== null ) {
                    var xmlString = this.modelingView.getModelXML(); 
                    if ( this.curModel ) {
                        this.curModel.set( 'xmlString', xmlString );
                    }
                }
                
                if ( model !== this.curModel ) {
                    this.curModel = model;
                }
                Backbone.trigger( 'selection:change', model, target, section );
            },

            setCurSection: function( section ) {
                this.curSection = section;
            }
        });

    return AppModel;
});