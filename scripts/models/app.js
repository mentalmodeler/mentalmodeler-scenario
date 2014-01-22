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
            curSection: null,
            modelingView: null,
            gridView: null,
            scenarioView: null,
            infoView:null,

            initialize: function () {
                AppModel.__super__.initialize.apply( this, arguments );
                this.set( 'mmps', new Backbone.Collection([], {model: MmpModel}) );
                //console.log('AppModel > initialize, this.get(mmps):',this.get('mmps') );
            },

            /*
             * adds a new mmp model, passing the xml string
             */
            addModel: function( xml ) {
                //console.log('AppModel > addMmpModel, xml:',xml);
                var mmps = this.get( 'mmps' );
                var mmp = new MmpModel( {xml:xml, justAdded:true } );
                var mmpView = new MmpView( {model:mmp} );
                mmps.add( mmp );
                //this.set( 'mmps', mmps );
                // this event will trigger a new model to be added to the list and it will automatically be selected
                Backbone.trigger( 'mmp:add', mmp );
            },

            selectionChange: function( model, target, section ) {
                //console.log('AppModel > selectionChange, model:',model,', target:',target,', (curModel:',this.curModel,')' );
                
                this.saveModelData();

                if ( model !== this.curModel ) {
                    this.curModel = model;
                }
                Backbone.trigger( 'selection:change', model, target, section );
            },

            setSection: function( section ) {
                //console.log('AppModel > setSection, section:',section);
                var sectionChanged = this.curSection !== section;
                if ( sectionChanged ) {
                    this.saveModelData();
                    this.curSection = section;
                    Backbone.trigger( 'section:change', section );
                }
            },

            saveModelData:function() {
                //console.log('AppModel > saveModelData, this.curSection:',this.curSection);
                
                // leaving from modeling section, so save data to model
                if ( this.curSection === 'modeling' && this.modelingView !== null && this.curModel ) {
                    this.curModel.setXML( this.modelingView.getModelXML() );
                }
            },

            /*****************
             *  Remove files
            ******************/
            remove:function (e) {
                var mmps = this.get( 'mmps' );
                if ( mmps.length > 1 && this.curModel) {
                    var modelToRemove = this.curModel;
                    var idx = mmps.indexOf( this.curModel );
                    if ( idx  === mmps.length - 1 ) {
                        idx -= 1
                    }
                    mmps.remove( modelToRemove );
                    this.curModel = null;
                    this.selectionChange( mmps.at(idx) );
                    
                    // this event will trigger a new model to be added to the list and it will automatically be selected
                    Backbone.trigger( 'mmp:remove');                   
                }
            },

            /*****************
             *  Load files
            ******************/

            loadFiles: function(e) {
                var mmpFiles = [];
                var files = e.target.files; // FileList object
                //console.log('loadFiles, e.target.files:',e.target.files)
                // files is a FileList of File objects. List some properties.
                for (var i = 0, f; f = files[i]; i++) {
                    var name = escape(f.name);
                    var type = f.type;
                    if (name.split('.').indexOf('mmp') === -1 ) {
                        continue;
                    }
                    mmpFiles.push( f );
                }

                this.readFiles( mmpFiles );
            },

            readFiles: function( files ) {
              var that = this
              var reader = new FileReader();
              var file = files.pop();
              //console.log('readFiles, file:',file,', files:',files);
              // Closure to capture the file information.
              reader.onload = (function(theFile) {
                return function(e) {
                    //console.log('loaded, files:',files); //,', e.target.result:',e.target.result);
                    that.addModel( e.target.result );
                    //Backbone.trigger( 'file:onload', e.target.result );
                    if ( files.length > 0 ) {
                        that.readFiles( files );
                    }
                };
              })(file);

              // Read in the image file as a data URL.
              reader.readAsText(file);
            }
        });

    return AppModel;
});