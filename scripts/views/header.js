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
    'swfobject'
], function ($, _, Backbone, Foundation, AbstractView, Template, ExportTable, ScenarioModel, SwfObject ) {
    'use strict';

    var HeaderView = AbstractView.extend({
        el: '#header',
        template: _.template( $(Template).html() ),
        tableTemplate: _.template( $(ExportTable).html() ),
        doLog: false,
        logPrefix: '==#== HeaderView > ',

        events: {
            'change input#load-file' : 'loadFiles',
            'click #newFile': 'newFile',
            'click #saveFile': 'saveFile',
            'click #deleteFile': 'remove',
            'click #exportCsv': 'exportCSV',
            'click #exportXls': 'exportXLS'
        },

        initialize: function() {
            HeaderView.__super__.initialize.apply( this, arguments );
            this.listenTo( Backbone, 'selection:change', this.onSelectionChange );
        },

        render: function() {
            var that = this;
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
        *  export data based on output format
        */

        exportData: function( type ) {
            var concepts = [];
            var curModel = window.mentalmodeler.appModel.curModel;
            if ( curModel ) {
                concepts = curModel.getConceptsForGrid();
            }
            var $table = $( this.tableTemplate( {concepts:concepts} ) );
            this.$el.append( $table );
            console.log('$table:',$table);
            $table.tableExport({
                type: type,
                escape: 'false',
                consoleLog: 'true'
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
        *  save file
        */

        saveFile: function() {
            var host = "http://45.55.174.38";
            var fileName = this.getFilename();

            $.ajax({
                type: "POST",
                url: host + "/mm/save",
                crossDomain: true,
                data: this.getXML(),
                contentType: "text/xml",
                dataType: "text",
                success: function(resp) { window.location.href = host + "/mm/download?id=" + resp + "&name=" + fileName; },
                error: function(xhr, exception) { 
                    if(xhr.status === 0) {
                        console.log("No connection. Server is down or you have network issues.");
                    } else if(xhr.status === 404) {
                        console.log("Requested URI not found. [404]");
                    } else if(xhr.status === 500) {
                        console.log("Internal server error. [500]");
                    } else if(exception === "timeout") {
                        console.log("Request timed out. Please try again.");
                    } else if(exception === "abort") {
                        console.log("Request aborted. Please try again.");
                    } else {
                        console.log("Uncaught error.\n" + xhr.responseText);
                    }
                }
            });
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