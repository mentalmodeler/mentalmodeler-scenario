/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'views/abstract',
    'text!templates/grid.html'
], function ($, _, Backbone, Foundation, AbstractView, Template) {
    'use strict';

    var GridView = AbstractView.extend({
        
        tagName: 'div',
        classNames: 'grid',
        template: _.template( $(Template).html() ),
        
        events: {
        },
        
        initialize: function() {
            GridView.__super__.initialize.apply( this, arguments );
            /*
            window.mentalmodeler.appModel.modelingView = this;
            this.listenTo( Backbone, 'window:resize', this.onWindowResize );
            */
            this.listenTo( Backbone, 'selection:change', this.onSelectionChange );
        },


        render: function() {
            var components = [];
            var curModel = window.mentalmodeler.appModel.curModel;
            if ( curModel ) {
                components = curModel.getComponents();
            }
            
            this.$el.html( this.template( {components:components} ) );
            return this;
        },

        onSelectionChange: function( model, target, section ) {
            this.render();
        }
    });

    return GridView;
});