/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'views/abstract',
    'text!templates/grid.html'
], function ($, _, Backbone, Foundation, AbstractView, Template ) {
    'use strict';

    var GridView = AbstractView.extend({
        
        tagName: 'div',
        className: 'grid',
        template: _.template( $(Template).html() ),
        
        events: {
        },
        
        initialize: function() {
            GridView.__super__.initialize.apply( this, arguments );
            
            this.listenTo( Backbone, 'selection:change', this.checkToRender );
            this.listenTo( Backbone, 'section:change', this.checkToRender );
            this.listenTo( Backbone, 'mmp:change', this.checkToRender );
        },


        render: function() {
            var concepts = [];
            var curModel = window.mentalmodeler.appModel.curModel;
            if ( curModel ) {
                concepts = curModel.getConceptsForGrid();
            }
            
            this.$el.html( this.template( {concepts:concepts} ) );
            $(document).foundation();
            return this;
        },

        checkToRender: function() {
            var appModel = window.mentalmodeler.appModel;
            if ( appModel.curSelection != null && appModel.curSection === 'grid' ) {
                this.render();
            }
        }
    });

    return GridView;
});