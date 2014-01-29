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

        availableHeight: 0,
        tableHeight: 0,

       events: {
            'change input[type="checkbox"]' : 'onSelectedChange',
            'change select': 'onInfluenceChange',
            'click button#refreshScenario': 'refreshScenario'
        },

        initialize: function() {
            ScenarioView.__super__.initialize.apply( this, arguments );
            this.listenTo( Backbone, 'selection:change', this.checkToRender );
            this.listenTo( Backbone, 'section:change', this.checkToRender );
        },

        refreshScenario:function() {
            var data = window.mentalmodeler.appModel.curModel.getDataForScenarioCalculation();
            console.log('refreshScenario, data:',data);            
        },

        onSelectedChange:function(e) {
            var $cb = $( e.target );
            var id = $cb.closest('tr').attr('data-id');
            var value = e.target.checked;
            var scenarioConcept = window.mentalmodeler.appModel.curSelection.conceptCollection.findWhere( {id:id} );
            //console.log('onSelectedChange,  $cb:', $cb,', id :',id,', value:',value,', scenarioConcept:',scenarioConcept);            
            if ( scenarioConcept ) {
                scenarioConcept.set( 'selected', value );
            }
        },

        onInfluenceChange:function(e) {
            var $select = $( e.target );
            var id = $select.closest('tr').attr('data-id');
            var value = $select.find('option:selected').val();
            var scenarioConcept = window.mentalmodeler.appModel.curSelection.conceptCollection.findWhere( {id:id} );
            //console.log('onInfluenceChange,  $select:', $select,', id :',id,', value:',value,', scenarioConcept:',scenarioConcept);            
            if ( scenarioConcept ) {
                scenarioConcept.set( 'influence', value );
            }
        },

        render: function() {
            //console.log( 'ScenarioView > render ');
            var data = { concepts: [] };
            var appModel = window.mentalmodeler.appModel;
            if ( appModel.curSelection != null && appModel.curSelectionType === 'scenario' ) {
                data.concepts = window.mentalmodeler.appModel.curSelection.getConceptsForScenario();
            }
            this.$el.html( this.template( data ) );
            
            // size table    
            var $button = this.$el.find('> .panel-left > button');
            var top = $button.position().top < 1 ? 38 : $button.position().top;
            this.$el.find('#scenarioTable').outerHeight( this.tableHeight - top + 10);
            
            //$(document).foundation();
            return this;
        },

        checkToRender: function() {
            var appModel = window.mentalmodeler.appModel;
            if ( appModel.curSelection != null && appModel.curSelectionType === 'scenario' && appModel.curSection === 'scenario' ) {
                this.render();
            }
        },

        setHeight: function ( availableHeight ) {
            this.availableHeight = availableHeight
            var $button = this.$el.find('> .panel-left > button');
            console.log()
            this.tableHeight = availableHeight - $button.outerHeight(true);
            //console.log('ScenarioView < setHeight, this.availableHeight:',this.availableHeight,' this.tableHeight:',this.tableHeight);
            this.render();
        }
    });

    return ScenarioView;
});
