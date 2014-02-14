/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'filesaver',
    'views/abstract',
    'text!templates/header.html',
    'models/scenario'
], function ($, _, Backbone, Foundation, FileSaver, AbstractView, Template, ScenarioModel) {
    'use strict';

    var HeaderView = AbstractView.extend({
        el: '#header',
        template: _.template( $(Template).html() ),
        doLog: false,
        logPrefix: '==#== HeaderView > ',

        events: {
            'change input#load-file' : 'loadFiles',
            'click #newFile': 'newFile',
            'click #saveFile': 'saveFile',
            'click #deleteFile': 'remove'
        },
        
        initialize: function() {
            HeaderView.__super__.initialize.apply( this, arguments );
            this.listenTo( Backbone, 'selection:change', this.onSelectionChange );
        },

        render: function() {
            this.$el.html( this.template( {} ) );
            this.$el.find('a.disabled').click( function(e) {
                e.preventDefault();
                return false;
            });
            this.log('render > this.el:',this.el,', this.$el:',this.$el);
            return this;
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

        /***************
         *  new file
        ****************/       
        
        newFile: function() {
            window.mentalmodeler.appModel.addModel();
        },

        /*****************
         *  Load files
        ******************/

        loadFiles: function(e) {
            this.log('loadfiles, e:',e);
            window.mentalmodeler.appModel.loadFiles(e);
        },

        /*****************
         *  save files
        ******************/

        saveFile: function(e) {
            window.mentalmodeler.appModel.saveFile();
        },

        /*****************
         *  remove files
        ******************/

        remove: function(e) {
            window.mentalmodeler.appModel.remove();
        }
    });

    return HeaderView;
});