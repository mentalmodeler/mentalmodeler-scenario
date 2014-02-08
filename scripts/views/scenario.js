/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'views/abstract',
    'views/scenarioGraph',
    'models/scenario',
    'models/mmp',
    'models/scenarioGraph',
    'text!templates/scenario.html'
], function ($, _, Backbone, Foundation, AbstractView, ScenarioGraphView, ScenarioModel, MmpModel, ScenarioGraphModel, Template) {
    'use strict';

    var ScenarioView = AbstractView.extend({

        tagName: 'div',
        className: 'scenario row',
        template: _.template( $(Template).html() ),

        availableHeight: 0,
        tableHeight: 0,
        doLog: false,

       events: {
            'input textarea#scenarioName' : 'onNameChange',
            'change input[type="checkbox"]' : 'onSelectedChange',
            'change select': 'onInfluenceChange',
            'click button#refreshScenario': 'refreshScenario'
        },

        initialize: function() {
            ScenarioView.__super__.initialize.apply( this, arguments );
            this.listenTo( Backbone, 'selection:change', this.checkToRender );
            this.listenTo( Backbone, 'section:change', this.checkToRender );
        },

        refreshScenario: function() {
            var scenarioData = window.mentalmodeler.appModel.curModel.getDataForScenarioCalculation();
            var sgView = new ScenarioGraphView( { model : new ScenarioGraphModel( scenarioData ) } );
            sgView.render();
            this.$el.find('> .panel-right').html(sgView.el);
        },

        onSelectedChange: function(e) {
            var $cb = $( e.target );
            var id = $cb.closest('tr').attr('data-id');
            var value = e.target.checked;
            var scenarioConcept = window.mentalmodeler.appModel.curSelection.conceptCollection.findWhere( {id:id} );
            //console.log('onSelectedChange,  $cb:', $cb,', id :',id,', value:',value,', scenarioConcept:',scenarioConcept);
            if ( scenarioConcept ) {
                scenarioConcept.set( 'selected', value );
            }
        },

        onInfluenceChange: function(e) {
            var $select = $( e.target );
            var id = $select.closest('tr').attr('data-id');
            var value = $select.find('option:selected').val();
            console.log('value:',value);
            value !== '' ? $select.addClass('hasValue') : $select.removeClass('hasValue');

            var scenarioConcept = window.mentalmodeler.appModel.curSelection.conceptCollection.findWhere( {id:id} );
            //console.log('onInfluenceChange,  $select:', $select,', id :',id,', value:',value,', scenarioConcept:',scenarioConcept);
            if ( scenarioConcept ) {
                scenarioConcept.set( 'influence', value );
            }
        },

        onNameChange:function(e) {            
            window.mentalmodeler.appModel.curSelection.set( 'name', this.$el.find('textarea#scenarioName').val() );
            Backbone.trigger( 'scenario:name-change' );
        },

        render: function() {
            this.log( 'ScenarioView > render ');
            var data = { concepts: [], name: '' };
            var appModel = window.mentalmodeler.appModel;
            if ( appModel.curSelection != null && appModel.curSelectionType === 'scenario' ) {
                data.concepts = window.mentalmodeler.appModel.curSelection.getConceptsForScenario();
                data.name = window.mentalmodeler.appModel.curSelection.get('name');
            }
            //console.log('data.concepts:',data.concepts);
            this.$el.html( this.template( data ) );

            // size table
            var $button = this.$el.find('> .panel-left > button');
            var top = $button.position().top < 1 ? 38 : $button.position().top;
            this.$el.find('#scenarioTable').outerHeight( this.tableHeight - top + 10);

            //$(document).foundation();
            return this;
        },

        checkToRender: function() {
            this.log( 'ScenarioView > checkToRender ');
            var appModel = window.mentalmodeler.appModel;
            if ( appModel.curSelection !== null && appModel.curSelectionType === 'scenario' && appModel.curSection === 'scenario' ) {
                this.render();
            }
        },

        setHeight: function ( availableHeight ) {
            this.availableHeight = availableHeight
            var $button = this.$el.find('> .panel-left > button');
            console.log()
            this.tableHeight = availableHeight - $button.outerHeight(true)  - parseInt( $('div.tabs-content').css('padding-bottom'), 10 );
            //console.log('ScenarioView < setHeight, this.availableHeight:',this.availableHeight,' this.tableHeight:',this.tableHeight);
            this.render();
        }
    });

    return ScenarioView;
});
