/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'views/abstract',
    'text!templates/header.html',
    'text!templates/exportTable.html',
    'models/scenario',
    'swfobject',
    'papaparse',
    'filesaver',
    'tableExport'
], function ($, _, Backbone, Foundation, AbstractView, Template, ExportTable, ScenarioModel, SwfObject, Papa ) {
    'use strict';

    var HeaderView = AbstractView.extend({
        el: '#header',
        template: _.template( $(Template).html() ),
        tableTemplate: _.template( $(ExportTable).html() ),
        doLog: false,
        logPrefix: '==#== HeaderView > ',

        events: {
            'change input#load-file' : 'loadFiles',
            'change input#import-csv' : 'importCSV',
            'click #newFile': 'newFile',
            'click #saveFile': 'saveFile',
            'click #deleteFile': 'remove',
            'click #print': 'print',
            'click #exportCsv': 'exportCSV',
            'click #exportXls': 'exportXLS'
        },

        initialize: function() {
            HeaderView.__super__.initialize.apply( this, arguments );
            this.listenTo( Backbone, 'selection:change', this.onSelectionChange );

            $(document).on('keydown', (e) => {
                if(e.key.toLowerCase() === 'p' && e.ctrlKey) {
                    this.print();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            });
        },

        render: function() {
            this.$el.html( this.template( {} ) );
            this.$el.find('a.disabled').click( function(e) {
                e.preventDefault();
                return false;
            });

            return this;
        },

        getFilename: function() {
            var filename = '';
            var appModel = window.mentalmodeler.appModel;
            if ( appModel.curModel ) {
                filename = appModel.curModel.get('filename');
            }

            return filename.replace(/\s/g, '') + (filename.indexOf('.mmp') !== -1 ? '' : '.mmp');
        },

        getXML: function() {
            var xml = '';
            var appModel = window.mentalmodeler.appModel;
            if ( appModel.curModel ) {
                // if section is modeling, update model from modeling data
                if ( appModel.curSection === 'modeling' ) {
                    appModel.saveModelData( true );
                }
                xml = appModel.curModel.getXML();
            }
            return xml;
        },

        onSelectionChange: function() {
            var removeEnabled = false;
            var appModel = window.mentalmodeler.appModel;
            this.log('onSelectionChange, appModel.curSelection:',appModel.curSelection,', appModel.curSelectionType:',appModel.curSelectionType );
            if ( appModel.curModel && appModel.curSelection ) {
                if ( appModel.curSelectionType === 'scenario' ) {
                    if ( appModel.curSelection.collection.length > 1 ) {
                        removeEnabled = true;
                    }
                }
                else if ( appModel.mmps.length > 1 ) {
                    removeEnabled = true;
                }
            }
            if ( removeEnabled ) {
                this.$el.find( '#deleteFile' ).removeClass( 'disabled' );
            }
            else {
                this.$el.find( '#deleteFile' ).addClass( 'disabled' );
            }

        },

        /*
        * import csv using papa parse
        */

        importCSV: function( e ) {
            let files = e.target && e.target.files;

            if ( files && files.length > 0 ) {
                _.each(files, ( file ) => {
                    Papa.parse(file, {
                        complete:  window.mentalmodeler.appModel.importCSV.bind(window.mentalmodeler.appModel)
                    });
                });
            }
        },

        /*
        *  export data based on output format
        */

        exportData: function( type ) {
            window.mentalmodeler.appModel.saveModelData();
            var concepts = [];
            var curModel = window.mentalmodeler.appModel.curModel;
            var fileName = this.getFilename().split(".")[0];
            if ( curModel ) {
                concepts = curModel.getConceptsForGrid();
            }
            var $table = $( this.tableTemplate( {concepts:concepts} ) );
            this.$el.append( $table );
            $table.tableExport({
                type: type,
                fileName: fileName,
                preventInjection: false,
                // separator: ','
                // ignoreColumn: [2,3],
                // tableName:'yourTableName'
                // pdfFontSize:14
                // pdfLeftMargin:20
                // htmlContent:'false'
            });
            $table.remove();
        },

        /*
        *  export xls
        */

        exportXLS: function() {
            this.exportData('excel');
        },

        /*
         *  export csv
         */

        exportCSV: function() {
            this.exportData('csv');
        },

        /*
         *  new file
         */

        newFile: function() {
            window.mentalmodeler.appModel.addModel();
        },

        /*
         * print concept map, metrics, and scenarios
         */

        print: function() {
            let header = this;
            let $activeTab = $('dd.active a');
            let printError = (e) => {
                alert("Printing error.");
                header._hidePrintArea();
                console.log(e);
            };

            this._showBlocker();

            this._printModel().then(() => {
                this._printMetrics().then(() => {
                    this._printScenarios().then(() => {
                        $("#printArea").show();
                        window.print();
                    }).catch(printError);
                }).catch(printError);
            }).catch(printError);

            $(window).one("afterprint", function() {
                $activeTab.click();
                this._hidePrintArea();
            }.bind(this));
        },

        _hidePrintArea: function() {
            $("*").removeClass("printable");
            $("#printArea").empty();
            $("#printArea").hide();
            this._hideBlocker();
        },

        _printModel: function() {
            $("a[href='#panel-modeling']").click();
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    let modelSSPromise = window.MentalModelerConceptMap.screenshot();
                    modelSSPromise.then((canvas) => {
                        $("#printArea").append(canvas);
                        resolve();
                    }).catch((e) => {
                        reject(e);
                    });
                }, 500);
            });
        },

        _printMetrics: function() {
            $("a[href='#panel-preferred']").click();
            return new Promise((resolve, reject) => {
                let rasterizePromise = this._rasterizeElement(document.querySelector("#panel-preferred"));
                rasterizePromise.then((canvas) => {
                    $(canvas).addClass('no-break');
                    $("#printArea").append(canvas);
                    resolve();
                }).catch((e) => {
                    reject(e);
                });
            });
        },

        _printScenarios: function() {
            return new Promise((resolve, reject) => {
                let $scenarios = $('.mmp.selected .scenarios-list').children();
                (async function() {
                    for(var i = 0; i < $scenarios.length; i++) {
                        $($scenarios[i]).click();
                        try {
                            let canvas = await this._rasterizeElement(document.querySelector("#panel-scenario"));
                            $(canvas).addClass('no-break');
                            $("#printArea").append(canvas);
                        } catch(e) {
                            reject(e);
                        }
                    }
                    resolve();
                }.bind(this))();
            });
        },

        _rasterizeElement: function(element) {
            $(element).addClass("printable");
            $(element).find("div").addClass("printable");

            $(element).find('svg').each((i, node) => {
                let rect = node.getBoundingClientRect();
                node.setAttribute('width', rect.width);
                node.setAttribute('height', rect.height);
                $(node).find("*").each((j, descNode) => {
                    $(descNode).css('fill', $(descNode).css('fill'));
                    $(descNode).css('stroke', $(descNode).css('stroke'));
                    $(descNode).css('font', $(descNode).css('font'));
                });
            });

            return html2canvas(element, {allowTaint: true, logging: false});
        },

        _showBlocker: function() {
            const overlay = document.createElement('div');
            overlay.innerHTML = `<div class="screenshot__message"><div class="screenshot__spinner"></div><span class="screenshot__text">Printing</span></div>`;
            overlay.classList.add('Print__screenshot-overlay');
            document.body.append(overlay);
        },

        _hideBlocker: function() {
            const overlay = document.querySelector('.Print__screenshot-overlay');
            document.body.removeChild(overlay);
        },

        /*
        *  save file
        */
        saveFile: function() {
            let blob = new Blob([this.getXML()], {type: "application/xml"});
            let filename = this.getFilename();

            saveAs(blob, filename);
       },

        /*
         *  Load files
         */

        loadFiles: function(e) {
            this.log('loadfiles, e:',e);
            window.mentalmodeler.appModel.loadFiles(e);
        },

        /*
         *  remove files
         */

        remove: function(e) {
            window.mentalmodeler.appModel.remove();
        }
    });

    return HeaderView;
});
