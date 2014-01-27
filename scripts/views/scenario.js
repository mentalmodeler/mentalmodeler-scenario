/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'd3',
    'views/abstract',
    'models/scenario',
    'models/mmp',
    'text!templates/scenario.html'
], function ($, _, Backbone, Foundation, d3, AbstractView, ScenarioModel, MmpModel, Template) {
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
            this.listenTo( Backbone, 'section:change', this.onSectionChange );
        },


        render: function() {
            console.log( 'ScenarioView > render ');
            var data = { concepts: [] };
            var appModel = window.mentalmodeler.appModel;
            if ( appModel.curSelection != null && appModel.curSelectionType === 'scenario' ) {
                data.concepts = window.mentalmodeler.appModel.curSelection.getConceptsForScenario();
                console.log('data.concepts:',data.concepts);
            }
            this.$el.html( this.template( data ) );
            //$(document).foundation();
            return this;
        },

        checkToRender: function() {
            var appModel = window.mentalmodeler.appModel;
            if ( appModel.curSelection != null && appModel.curSelectionType === 'scenario' ) {
                this.render();
            }
        },

        onSelectionChange: function( model, target, section ) {
            //console.log('ScenarioView > onSelectionChange, appModel.curSelection:',appModel.curSelection,', appModel.curModel:',appModel.curModel);
            this.checkToRender();
        },

        onSectionChange: function( model, target, section ) {
            //console.log('ScenarioView > onSectionChange, appModel.curSelection:',appModel.curSelection,', appModel.curModel:',appModel.curModel);
            this.checkToRender();
        }
    });

    return ScenarioView;
});
