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
    'downloadify',
    'swfobject'
], function ($, _, Backbone, Foundation, AbstractView, Template, ExportTable, ScenarioModel, Downloadify, SwfObject ) {
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
            'click #deleteFile': 'remove',
            'click #exportCsv': 'exportCSV'
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

            window.Downloadify.create('saveFile', {
                filename: this.getFilename,
                data: this.getXML,
                onComplete: function(){
                  //alert('Your File Has Been Saved!');
                },
                onCancel: function(){
                  //alert('You have cancelled the saving of this file.');
                },
                onError: function(){
                  //alert('You must put something in the File Contents or there will be nothing to save!');
                },
                transparent: true,
                swf: 'swf/downloadify.swf',
                downloadImage: 'img/save_button.png',
                width: 75,
                height: 45,
                append: false
            });

            this.log('render > window.Downloadify:',window.Downloadify,', Downloadify:',Downloadify,', this.el:',this.el,', this.$el:',this.$el);
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
         *  export csv
         */

        exportCSV: function() {
            var concepts = [];
            var curModel = window.mentalmodeler.appModel.curModel;
            if ( curModel ) {
                concepts = curModel.getConceptsForGrid();
            }
            var $table = $( this.tableTemplate( {concepts:concepts} ) );
            this.$el.append( $table );
            console.log('$table:',$table);
            $table.tableExport({
                type:'csv',
                escape:'false',
                consoleLog:'true'
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
         *  new file
         */

        newFile: function() {
            window.mentalmodeler.appModel.addModel();
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