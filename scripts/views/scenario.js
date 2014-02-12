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
        sgView: null,
        availableHeight: 0,
        doLog: true,

       events: {
            'input textarea#scenarioName' : 'onNameChange',
            'change input[type="checkbox"]' : 'onSelectedChange',
            'change select': 'onInfluenceChange',
            'click button#refreshScenario': 'refreshScenario'
        },

        initialize: function() {
            _.bindAll( this, 'refreshScenario' );
            ScenarioView.__super__.initialize.apply( this, arguments );
            this.listenTo( Backbone, 'selection:change', this.checkToRender );
            this.listenTo( Backbone, 'section:change', this.checkToRender );
            this.sgView = new ScenarioGraphView();
        },

        refreshScenario: function() {
            var curModel = window.mentalmodeler.appModel.curModel;
            this.log('refreshScenario, curModel:',curModel);
            if ( curModel && curModel.conceptCollection.length > 0 ) {
                this.log('     curModel.conceptCollection:',curModel.conceptCollection );
                var scenarioData = curModel.getDataForScenarioCalculation();
                this.sgView.setModel( new ScenarioGraphModel( scenarioData ) );    
            }
        },

        onSelectedChange: function(e) {
            var $cb = $( e.target );
            var id = $cb.closest('tr').attr('data-id');
            var value = e.target.checked;
            var scenarioConcept = window.mentalmodeler.appModel.curSelection.conceptCollection.findWhere( {id:id} );
            //console.log('onSelectedChange,  $cb:', $cb,', id :',id,', value:',value,', scenarioConcept:',scenarioConcept);
            if ( scenarioConcept ) {
                scenarioConcept.set( 'selected', value );
                this.refreshScenario();
            }
        },

        onInfluenceChange: function(e) {
            var $select = $( e.target );
            var $tr = $select.closest('tr');
            var id = $tr.attr('data-id');
            var value = $select.find('option:selected').val();
            this.log('value:',value);
            if ( value !== '' ) {
                $select.addClass('hasValue');
                $tr.addClass('hasValue');
            }
            else {
                $select.removeClass('hasValue');
                $tr.removeClass('hasValue');
            }

            var scenarioConcept = window.mentalmodeler.appModel.curSelection.conceptCollection.findWhere( {id:id} );
            //console.log('onInfluenceChange,  $select:', $select,', id :',id,', value:',value,', scenarioConcept:',scenarioConcept);
            if ( scenarioConcept ) {
                scenarioConcept.set( 'influence', value );
                this.refreshScenario();
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
            this.$el.html( this.template( data ) );
            this.sgView.setElement( this.$el.find('div.panel-right') );

            // size table
            var $scenarioTable = this.$el.find('#scenarioTable');
            var top = $scenarioTable.position().top < 1 ? 95 : $scenarioTable.position().top;
            $scenarioTable.outerHeight( this.availableHeight - top + 10);

            var $table = this.$el.find('#tableTable');
            console.log( '$scenarioTable.height():',$scenarioTable.height(),', $table.height()):', $table.height() );
            console.log( '$table:',$table,', $table.prop(scrollHeight):',$table.prop('scrollHeight'),', $table.height():',$table.outerHeight() );

            return this;
        },

        checkToRender: function() {
            this.log( 'ScenarioView > checkToRender ');
            var appModel = window.mentalmodeler.appModel;
            if ( appModel.curSelection !== null && appModel.curSelectionType === 'scenario' && appModel.curSection === 'scenario' ) {
                this.render();
                setTimeout( this.refreshScenario, 100);
            }
        },

        setHeight: function ( availableHeight ) {
            this.availableHeight = availableHeight
            this.render();
        }
    });

    return ScenarioView;
});
