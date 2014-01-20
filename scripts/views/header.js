/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'filesaver',
    'views/abstract',
    'text!templates/header.html'
], function ($, _, Backbone, Foundation, FileSaver, AbstractView, Template) {
    'use strict';

    var HeaderView = AbstractView.extend({
        el: '#header',
        template: _.template( $(Template).html() ),

        events: {
            'change input#load-file' : 'loadFiles',
            'click #newFile': 'newFile',
            'click #saveFile': 'saveFile',
            'click #deleteFile': 'remove'
        },
        
        initialize: function() {
            HeaderView.__super__.initialize.apply( this, arguments );
            //console.log('header > init >this.el:',this.el,', this.$el:',this.$el);
            //this.setElement( this.el );
        },

        render: function() {
            this.$el.html( this.template( {} ) );
            this.$el.find('a.disabled').click( function(e) {
                e.preventDefault();
                return false;
            });
            //console.log('header > render > this.el:',this.el,', this.$el:',this.$el);
            return this;
        },

        /***************
         *  new file
        ****************/       
        
        newFile: function() {
            window.mentalmodeler.appModel.addModel('');
        },

        /*****************
         *  Load files
        ******************/

        loadFiles: function(e) {
            window.mentalmodeler.appModel.loadFiles(e);
        },

        /*****************
         *  save files
        ******************/

        saveFile: function(e) {
            console.log('saveFile');
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