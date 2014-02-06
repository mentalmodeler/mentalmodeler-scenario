/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'd3',
    'foundation',
    'views/abstract',
    'text!templates/scenarioGraph.html'
], function ($, _, Backbone, d3, Foundation, AbstractView, Template ) {
    'use strict';

    var ScenarioGraphView = AbstractView.extend({   

    	template: _.template( $(Template).html() ),

        initialize: function() {
            ScenarioGraphView.__super__.initialize.apply( this, arguments );
            _.bindAll( this, 'render' );
        },

        render: function() {
        	var data = this.model.getData();
        	var concepts = this.model.getConcepts();
        	this.$el.html( this.template() );
        }
    });

    return ScenarioGraphView;
});