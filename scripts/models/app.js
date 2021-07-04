/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract',
    'models/mmp',
    'views/mmp',
    'models/scenario',
    'dagre'

], function ( $, _, Backbone, AbstractModel, MmpModel, MmpView, ScenarioModel, Dagre ) {
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
            values: {
                'H+' : 1,
                'M+' : 0.62, // 0.75,
                'L+' : 0.25, // 0.5,
                ''   : 0,
                'H-' : -1,
                'M-' : -0.62, // -0.75,
                'L-' : -0.25 // -0.5
            },
            doLog: false,
            logPrefix: '\n======== AppModel > ',

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
                this.log('start');
                this.getView().resizeScrollPanels();
                    
                if ( window.mmConfig && window.mmConfig.loadFile ) {
                    this.loadFileFromServer( window.mmConfig.loadFile );
                } else {
                    this.addModel();
                }
            },

            /*
             * adds a new mmp model, passing the xml string
             */
            addModel: function( data, fileName ) {
                var type = this.determineFileType(data);
                var options = {justAdded: true, filename: fileName};

                switch (type) {
                    case 'xml':
                        options.xml = data;
                        options.data = data;
                        options.type = 'xml';
                        break;
                    case 'json':
                        options.json = data;
                        options.data = data;
                        options.type = 'json';
                        break;
                    default:
                        break;
                }
                var mmp = new MmpModel( options );
                var mmpView = new MmpView( {model:mmp} );
                this.mmps.add( mmp );
                
                // this event will trigger a new model to be added to the list and it will automatically be selected
                Backbone.trigger( 'mmp:add', mmp );
            },

            determineFileType(data) {
                if (typeof data === 'string' && data.length > 0) {
                    if (data.startsWith('<')) {
                        return 'xml'
                    }
                    try {
                        JSON.parse(data);
                        return 'json'
                    } catch (e) {
                        console.log('ERROR > determineFileType\ne:', e)
                        return ''
                    }
                }
                return '';
            },

            // addModel: function( xml, fileName ) {
            //     console.log('addModel');
            //     var options = { justAdded: true };
            //     if (typeof xml !== 'undefined' && xml !== '') {
            //         options.xml = xml;
            //     }
            //     options.filename = fileName;
            //     var mmp = new MmpModel( options );
            //     var mmpView = new MmpView( {model:mmp} );
            //     this.mmps.add( mmp );
                
            //     // this event will trigger a new model to be added to the list and it will automatically be selected
            //     Backbone.trigger( 'mmp:add', mmp );
            // },

            /*
             * adds a new mmp model, passing the xml string
             */
            addScenario: function( xml ) {
                this.log('addScenario');
                var options = { justAdded: true };
                if (typeof xml !== 'undefined' && xml !== '') {
                    options.xml = xml;
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
                this.saveModelData();
                var idx;
                this.log('selectionChange');
                if ( typeof target !== 'undefined' ) {
                    // this is coming from a a user click on a model map or scenario
                    if ( $target.hasClass('scenario') ) {
                        idx = $target.index();
                        model.scenarioIndex = idx;
                        this.curSelection = model.scenarioCollection.at(idx);
                        this.curSelectionType = "scenario";
                        // console.log('>>>>> scenario link\nthis.curSelection:', this.curSelection);
                    }
                    else if ( $target.hasClass('map') ) {
                        this.curSelection = model;
                        this.curSelectionType = "mmp";
                        // console.log('>>>>> mmp link');
                    }
                }
                else {
                    // no target
                    if ( typeof scenario !== 'undefined' && scenario instanceof ScenarioModel ) {
                        this.log('\tpassed scenario:',scenario);
                        this.curSelection = scenario;
                        this.curSelectionType = "scenario";
                        model.scenarioIndex = scenario.collection.indexOf( scenario );
                    }
                }

                // console.log('selectionChange'
                //     , '\n\tselectionType:', selectionType
                //     , '\n\tidx:', idx
                //     , '\n\tprevSelectionType:', prevSelectionType
                //     // , '\n\tmodel.scenarioIndex:', model.scenarioIndex
                //     // , '\n\tmodel:', model
                //     , '\n\tthis.curSelection:', this.curSelection
                //     , '\n\tscenario:', scenario
                //     // , '\n\ttarget:', target
                // );
                
                if ( model !== this.curModel ) {
                    this.curModel = model;
                }
                //.log('Trigger selection:change, model:',model,', target:',target,', section:',section );
                Backbone.trigger( 'selection:change', model, target, section );
            },

            setSection: function( section ) {
                var prevSection = this.curSection;
                var sectionChanged = section !== prevSection;
                this.log('setSection\n\tsection:',section,'\n\tprevSection:',prevSection,'\n\tsectionChanged:',sectionChanged);

                if ( sectionChanged ) {
                    if (prevSection === 'modeling' || prevSection === 'grid' || prevSection === 'preferred') {
                        this.saveModelData();
                    }
                    this.curSection = section;
                    if ( section === 'scenario' && this.curSelectionType !== 'scenario' ) {
                        // auto select a scenario
                        this.selectionChange( this.curModel, undefined, undefined, this.curModel.scenarioCollection.at(this.curModel.scenarioIndex) );
                    }
                    
                    // var needToAutoSelectScenario = section === 'scenario' && this.curSelectionType !== 'scenario';
                    // if (!needToAutoSelectScenario) {
                    //     this.saveModelData();
                    // }
                    // this.curSection = section;
                    // if ( needToAutoSelectScenario ) {
                    //     // auto select a scenario
                    //     this.selectionChange( this.curModel, undefined, undefined, this.curModel.scenarioCollection.at(this.curModel.scenarioIndex) );
                    // }
                    
                    Backbone.trigger( 'section:pre-change', section, prevSection );
                }
            },

            saveModelData:function( force ) {
                this.log('saveModelData, this.curSection:',this.curSection,' force:',force);
                // leaving from modeling section, so save data to model
                if ( (typeof force !== 'undefined' && force) || this.curSection === 'modeling' && this.modelingView !== null && this.curModel ) {
                    if (window.MentalModelerUseFlash) {
                        this.curModel.updateXMLFromModelSection( this.modelingView.getModelXML() );
                    } else {
                        // this.curModel.updateJSFromModelSection( this.modelingView.getModelXML() );
                        this.curModel.updateJSFromModelSection( this.modelingView.getModelJS().js );
                    }
                }
            },

            // saveModelData:function( force ) {
            //     this.log('saveModelData, this.curSection:',this.curSection,' force:',force);
            //     // leaving from modeling section, so save data to model
            //     if ( (typeof force !== 'undefined' && force) || this.curSection === 'modeling' && this.modelingView !== null && this.curModel )) {
            //         if (window.MentalModelerUseFlash) {
            //             this.curModel.updateXMLFromModelSection( this.modelingView.getModelXML() );
            //         } else {
            //             // this.curModel.updateJSFromModelSection( this.modelingView.getModelXML() );
            //             this.curModel.updateJSFromModelSection( this.modelingView.getModelJS().js );
            //         }
            //     }
            // },

            /*
             *  retrieve values
             */
            getInfluenceValue:function ( type ) {
                var value = 0;
                var val = parseFloat( type );
                if ( !_.isNaN(val) ) {
                    value = val;
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
                                idx -= 1;
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

            importCSV: function( results, file ) {
                if ( !results.errors.length ) {
                    const nodeWidth = 125;
                    const nodeHeight = 35;
                    let data = results.data;
                    let g = new Dagre.graphlib.Graph();
                    let mmpFileName = file.name.split( "." )[ 0 ] + ".mmp";
                    let json = {
                        info: {},
                        concepts: []
                    };

                    g.setGraph({ rankdir: "LR", align: "UL", nodesep: 20, edgesep: 5, ranksep: 0, acyclicer: "greedy" });
                    g.setDefaultEdgeLabel(function() { return {}; });
    
                    _.each(data, ( row, rIndex ) => {
                        if ( !rIndex ) {
                            json.info.name = row[ rIndex ]; 
                            _.each(row.slice( 1, row.length ), ( concept, cIndex ) => {
                                if ( concept !== "" ) {
                                    let name = concept.replace( /\"/g, "" );
                                    let lines = name.length / 20 < 1 ? 1 : name.length / 20;

                                    json.concepts.push({
                                        id: cIndex,
                                        name: name,
                                        x: 0,
                                        y: 0,
                                        relationships: []
                                    });

                                    g.setNode( name, { label: name, width: nodeWidth, height: nodeHeight * lines } );
                                }
                            });
                        }
                        else {
                            _.each(row.slice( 1, row.length ), ( value, cIndex ) => {
                                let influence = parseFloat( value.replace( /\"/g, "" ) );
                                if ( !isNaN( influence ) && influence ) {
                                    let concept = json.concepts[ rIndex - 1 ];
                                    let relatedConcept = json.concepts[ cIndex ];
    
                                    concept.relationships.push({
                                         id: relatedConcept.id,
                                         name: relatedConcept.name,
                                         influence: influence
                                    });

                                    g.setEdge( concept.name, relatedConcept.name );
                                }
                            });
                        }
                    });

                    Dagre.layout(g);

                    _.each(g.nodes(), ( name, index ) => {
                        let concept = json.concepts[ index ];
                        let node = g.node( name );

                        concept.x = node.x;
                        concept.y = node.y;
                    });

                    this.addModel( JSON.stringify( json ), mmpFileName );
                } else {
                    console.log( "## CSV PARSE ERRORS ##" );

                    _.each(results.errors, ( error ) => {
                        console.error( error.message );
                    });

                    alert( "Import CSV failed! Check the browser console for details." );
                }
            },

            loadFileFromServer: function( filePath ) {
                var a = filePath.split( '/' );
                var s = a[ a.length - 1 ].split( '.' );
                var name = s[ 0 ];
                var xhr = new XMLHttpRequest();
                xhr.open( 'GET', filePath, true );
                xhr.responseType = 'text';
                xhr.onload = function( e ) {
                    // console.log('\txhr.response:', xhr.response);
                    this.addModel( xhr.response, name );
                }.bind(this);
                xhr.send();
            },

            /*
             *  Load files
             */
            loadFiles: function(e) {
                this.log('loadFiles');
                var mmpFiles = [];
                var files = e.target.files; // FileList object
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
                //that.log('reader.onload, theFile:',theFile)
                return function(e) {
                    //that.log('loaded, files:',files,', theFile:',theFile,', e.target.result:',e.target.result);
                    if (typeof e.target.result === 'string' && !e.target.result.includes('<compareref/>')) {
                        that.addModel( e.target.result, theFile.name );
                    }
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