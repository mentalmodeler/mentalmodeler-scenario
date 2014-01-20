/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'views/abstract',
    'text!templates/header.html'
], function ($, _, Backbone, Foundation, AbstractView, Template) {
    'use strict';

    var HeaderView = AbstractView.extend({
        el: '#header',
        template: _.template( $(Template).html() ),

        events: {
            'change input#load-file' : 'loadFiles',
            'click #newFile': 'newFile'
        },
        
        initialize: function() {
            HeaderView.__super__.initialize.apply( this, arguments );
            //console.log('header > init >this.el:',this.el,', this.$el:',this.$el);
            //this.setElement( this.el );
        },

        render: function() {
            this.$el.html( this.template( {} ) );
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
            //console.log('handleFileSelect, e:',e);
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

        readFiles: function( files ) {
          var that = this
          var reader = new FileReader();
          var file = files.pop();
          //console.log('readFiles, file:',file,', files:',files);
          // Closure to capture the file information.
          reader.onload = (function(theFile) {
            return function(e) {
                //console.log('loaded, files:',files); //,', e.target.result:',e.target.result);
                window.mentalmodeler.appModel.addModel( e.target.result );
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

    return HeaderView;
});