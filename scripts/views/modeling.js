/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'jquerySwfobject',
    'views/abstract'
], function ($, _, Backbone, Foundation, $swfobject, AbstractView) {
    'use strict';

    var ModelingView = AbstractView.extend({
        
        tagName: 'div',
        id: 'flash-model',
        
        events: {
        },
        
        initialize: function() {
            ModelingView.__super__.initialize.apply( this, arguments );
            //Backbone.on( 'window:resize', this.onWindowResize, this );
            //Backbone.on( 'file:onload', this.onFileLoaded, this );
            window.mentalmodeler.appModel.modelingView = this;
            this.listenTo( Backbone, 'selection:change', this.onSelectionChange );
        },

        render: function() {            
            console.log("------- render");
            this.$el.flash({ swf: 'img/mentalmodeler.swf',
                             height: '100%',
                             width: '100%'
            });
            return this;
        },

        getModelXML:function() {
            var xml = '';
            this.$el.flash(
                function() {
                   xml = this.doSave();
                }
            );
            return xml;
        },

        onSelectionChange: function( model, target, section ) {
            console.log('--- modeling > onSelectionChange');
            var xmlString = model.get('xmlString');
            this.$el.flash(
                function() {
                    this.doLoad( xmlString );
                }
            );
        }
    });

    return ModelingView;
});