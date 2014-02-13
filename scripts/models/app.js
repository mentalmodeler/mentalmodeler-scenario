/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract',
    'models/mmp',
    'views/mmp',
    'models/scenario'

], function ( $, _, Backbone, AbstractModel, MmpModel, MmpView, ScenarioModel ) {
    'use strict';

    var AppModel = AbstractModel.extend({
            
            version: '1.1',

            defaults: {
            },
            mmps: null,
            curModel: null,
            prevSection: null,
            curSection: 'modeling',
            curSelection: null,
            curSelectionType: null, // 'scenario' or 'mmp'
            modelingView: null,
            gridView: null,
            scenarioView: null,
            infoView:null,
            values:{ 'H+' : 1,
                     'M+' : 0.5,
                     'L+' : 0.25,
                     ''   : 0,
                     'H-' : -1,
                     'M-' : -0.5,
                     'L-' : -0.25
                   },
            doLog: false,
            logPrefix: '======== AppModel > ',

            initialize: function () {
                AppModel.__super__.initialize.apply( this, arguments );
                this.mmps = new Backbone.Collection( [], {model: MmpModel} );
            },

            onMmpRemoved:function( e ) {
                this.log('onMmpRemoved, e:',e,'e.index:',e.index);
            },

            /*
             * once flash has initialized, start app
             */
            start: function() {
                this.getView().resizeScrollPanels();
                this.addModel();
            },

            /*
             * adds a new mmp model, passing the xml string
             */
            addModel: function( xml ) {
                var options = { justAdded: true };
                if (typeof xml !== 'undefined' && xml !== '') {
                    options.xml = xml
                }
                
                var mmp = new MmpModel( options );
                var mmpView = new MmpView( {model:mmp} );
                this.mmps.add( mmp );
                
                // this event will trigger a new model to be added to the list and it will automatically be selected
                Backbone.trigger( 'mmp:add', mmp );
            },

            /*
             * adds a new mmp model, passing the xml string
             */
            addScenario: function( xml ) {
                var options = { justAdded: true };
                if (typeof xml !== 'undefined' && xml !== '') {
                    options.xml = xml
                }
                
                var mmp = new MmpModel( options );
                var mmpView = new MmpView( {model:mmp} );
                this.mmps.add( mmp );
                
                // this event will trigger a new model to be added to the list and it will automatically be selected
                Backbone.trigger( 'mmp:add', mmp );
            },

            selectionChange: function( model, target, section, scenario ) {
                var $target = $( target);
                var prevSelection = this.curSelection;
                var prevSelectionType = this.curSelectionType;
                var selectionType = model instanceof MmpModel ? 'mmp' : 'scenario';
                this.log('selectionChange, selectionType:',selectionType );

                this.saveModelData();

                if ( typeof target !== 'undefined' ) {
                    // this is coming from a a user click on a model map or scenario
                    if ( $target.hasClass('scenario') ) {
                        var idx = $target.index();
                        model.scenarioIndex = idx;
                        this.curSelection = model.scenarioCollection.at(idx);
                        this.curSelectionType = "scenario";
                    }
                    else if ( $target.hasClass('map') ) {
                        this.curSelection = model;
                        this.curSelectionType = "mmp";
                    }
                    
                }
                else {
                    // no target
                    if ( typeof scenario !== 'undefined' && scenario instanceof ScenarioModel ) {
                        this.log('        passed scenario:',scenario);
                        this.curSelection = scenario;
                        this.curSelectionType = "scenario";
                        model.scenarioIndex = scenario.collection.indexOf( scenario );
                    }
                }

                this.log('selectionChange, model:',model,', target:',target,', model.scenarioIndex:',model.scenarioIndex ,',  (this.curSelection:',this.curSelection,', prevSelection:',prevSelection,')' );

                if ( model !== this.curModel ) {
                    this.curModel = model;
                }
                //.log('Trigger selection:change, model:',model,', target:',target,', section:',section );
                Backbone.trigger( 'selection:change', model, target, section );
            },

            setSection: function( section ) {
                var sectionChanged = this.curSection !== section;
                var prevSection = this.curSection;
                this.log('setSection, section:',section,', prevSection:',prevSection,', sectionChanged:',sectionChanged);
                
                if ( sectionChanged ) {
                    this.saveModelData();
                    this.curSection = section;                    
                    if ( section === 'scenario' && this.curSelectionType !== 'scenario') {
                        // auto select a scenario
                        this.selectionChange( this.curModel, undefined, undefined, this.curModel.scenarioCollection.at(this.curModel.scenarioIndex) );
                    }
                    Backbone.trigger( 'section:pre-change', section, prevSection );
                }
            },

            saveModelData:function() {
                //this.log('AppModel > saveModelData, this.curSection:',this.curSection);
                
                // leaving from modeling section, so save data to model
                if ( this.curSection === 'modeling' && this.modelingView !== null && this.curModel ) {
                    this.curModel.updateFromModelSection( this.modelingView.getModelXML() );
                }
            },

            /*
             *  retrieve values
             */
            getInfluenceValue:function ( type ) {
                var value = 0;
                switch ( type ) {
                    case 'H+':
                    case '+++':
                        value =  this.values[ 'H+' ];
                        break;
                    case 'M+':
                    case '++':
                        value =  this.values[ 'M+' ];
                        break;
                    case 'L+':
                    case '+':
                        value =  this.values[ 'L+' ];
                        break;
                    case 'H-':
                    case '---':
                        value =  this.values[ 'H-' ];
                        break;
                    case 'M-':
                    case '--':
                        value =  this.values[ 'M-' ];
                        break;
                    case 'L-':
                    case '-':
                        value =  this.values[ 'L-' ];
                        break;
                }
                return value;
            },

            /*
             *  Remove files
             */
            remove:function (e) {
                this.log('remove');
                if ( this.curModel && this.curSelection ) {
                    if ( this.curSelection instanceof ScenarioModel ) {
                        var scenario = this.curSelection;
                        if ( scenario && scenario.collection && scenario.collection.length > 1 ) {
                            var idx = scenario.collection.indexOf( scenario );
                            if ( idx  === scenario.collection.length - 1 ) {
                                idx -= 1
                            }
                            // clean up scenario
                            scenario.close();
                            var collection = scenario.collection;
                            scenario.collection.remove( scenario );
                            this.curSelection = null;
                            this.selectionChange( this.curModel, undefined, undefined, collection.at(idx) );
                            
                            Backbone.trigger( 'scenario:remove');
                        }
                        
                    } else if ( this.curSelection instanceof MmpModel ) {
                        this.log('remove mmp');
                        if ( this.mmps.length > 1 ) {
                            this.log('mmp.length > 1');
                            var modelToRemove = this.curModel;
                            var idx = this.mmps.indexOf( this.curModel );
                            if ( idx  === this.mmps.length - 1 ) {
                                idx -= 1
                            }
                            // clean up model
                            modelToRemove.close();
                            this.mmps.remove( modelToRemove );
                            this.curModel = null;
                            this.selectionChange( this.mmps.at(idx) );
                            
                            Backbone.trigger( 'mmp:remove');         
                        }
                    }
                    else {
                      this.log('remove called for other type');  
                    }
                }
            },

             /*
             *  Save file
             */
            saveFile: function() {
                this.log('saveFile, this.curModel:',this.curModel );
                if ( this.curModel ) {
                    var xml = this.curModel.getXML();
                }
            },

            /*
             *  Load files
             */
            loadFiles: function(e) {
                this.log('loadFiles');
                var mmpFiles = [];
                var files = e.target.files; // FileList object
                //this.log('loadFiles, e.target.files:',e.target.files)
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

            /*
             *  read files
             */
            readFiles: function( files ) {
              this.log('readFiles');
              var that = this
              var reader = new FileReader();
              var file = files.pop();
              //this.log('readFiles, file:',file,', files:',files);
              // Closure to capture the file information.
              reader.onload = (function(theFile) {
                return function(e) {
                    //this.log('loaded, files:',files); //,', e.target.result:',e.target.result);
                    that.addModel( e.target.result );
                    //Backbone.trigger( 'file:onload', e.target.result );
                    if ( files.length > 0 ) {
                        that.readFiles( files );
                    } else {
                        $('input[type="file"]').val(null);
                    }
                };
              })(file);

              // Read in the image file as a data URL.
              reader.readAsText(file);
            }
        });

    return AppModel;
});