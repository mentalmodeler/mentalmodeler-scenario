/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'views/abstract',
    'text!templates/scenario.html'
], function ($, _, Backbone, Foundation, AbstractView, Template) {
    'use strict';

    var ScenarioView = AbstractView.extend({
        
        tagName: 'div',
        className: 'scenario row',
        template: _.template( $(Template).html() ),
        
        events: {
        },
        
        initialize: function() {
            ScenarioView.__super__.initialize.apply( this, arguments );
            this.listenTo( Backbone, 'selection:change', this.onSelectionChange );
            //this.listenTo( Backbone, 'mmp:xmlStringChange', this.onSelectionChange );
        },


        render: function() {
            this.$el.html( this.template( {} ) );
            //$(document).foundation();
            return this;
        },

        onSelectionChange: function( model, target, section ) {
            //this.render();
        }
    });

    return ScenarioView;
});