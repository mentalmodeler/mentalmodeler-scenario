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
    'text!templates/scenario.html',
    'util/inputUtils'
], function ($, _, Backbone, Foundation, AbstractView, ScenarioGraphView, ScenarioModel, MmpModel, ScenarioGraphModel, Template, InputUtils) {
    'use strict';

    var ScenarioView = AbstractView.extend({

        tagName: 'div',
        className: 'scenario row',
        template: _.template( $(Template).html() ),
        sgView: null,
        availableHeight: 0,
        doLog: false,
        logPrefix: '-*-*- ScenarioView > ',
        $currentSlider: null,
        squashFunc: "sigmoid",

       events: {
            'input textarea#scenarioName' : 'onNameChange',
            'change select#scenarioSquash': 'onSquashChange',
            'change input[type="checkbox"]' : 'onSelectedChange',
            'click button#refreshScenario': 'refreshScenario',
            'mousedown tr:not(.notIncludedInScenario) > .mutable': 'showSlider',
            'input .slider': 'onSliderUpdate',
            'input .input': 'onTextInput',
            'blur .input': 'onTextInput',
            'change .slider': 'onSliderUpdate'
        },

        initialize: function() {
            _.bindAll( this, 'refreshScenario' );
            ScenarioView.__super__.initialize.apply( this, arguments );
            this.listenTo( Backbone, 'selection:change', this.onSelectionChange );
            this.listenTo( Backbone, 'section:change', this.onSectionChange );
            this.sgView = new ScenarioGraphView();

            this.debouncedRefreshScenario = _.debounce( this.refreshScenario, 500 );
        },

        // --------------------- slider / input events --------------------------

        showSlider: function( e ) {
            if ( this.$currentSlider !== null ) {
                this.$currentSlider.removeClass('shown');
            }
            this.$currentSlider = $(e.target).closest('td').find('.slider').addClass('shown');
            $(document).on( 'click.gridSlider',function( e ) {
                var $slider = $(e.target).closest('td').find('.slider');//.addClass('shown');
                if ( !$slider.is(this.$currentSlider) ) {
                    if ( this.$currentSlider ) {
                        this.$currentSlider.removeClass('shown');
                    }
                    this.$currentSlider = null;
                    $(document).off( 'click.gridSlider' );
                }
            }.bind(this) );
        },

        onTextInput:function( e ) {
            var $input = $(e.currentTarget);
            var $td = $input.closest('td');
            var id = $input.closest( 'tr' ).attr( 'data-id' );
            var validationOptions = {
                default: 0,
                min: -1,
                max: 1,
                canBeEmpty: true
            };
            var value = InputUtils.filterInput ($input, 'float', e.type, validationOptions);
            var v = Math.round(value * 100) / 100;
            if ( e.type !== 'input' ) {
                if ( v !== value ) {
                    $input.val( v );
                }
                if ( v === 0 ) {
                    $input.val( '' );
                }
            }
            this.updateValue( id, v, $td );
            $td.find( '.slider' ).val( v );
        },

        onSliderUpdate: function( e ) {
            //console.log('onSliderUpdate, e.type:',e.type);
            var $slider = $( e.target );
            var value = $slider.val();
            var $td = $slider.closest( 'td' );
            var $input = $td.find('.input').val( value );
            var id = $slider.closest('tr').attr('data-id');
            if ( e.type === 'change' ) {
                //console.log('type is change, updateValue');
                this.updateValue( id, value, $td);
            }
        },

        updateValue: function( id, value, $td ) {
            var $tr = $td.closest('tr');
            var value = parseFloat(value);
            value === 0 ? $td.removeClass('hasValue') : $td.addClass('hasValue');
            value === 0 ? $tr.removeClass('hasValue') : $tr.addClass('hasValue');
            //console.log('updateValue, id:',id,', value:',value);
            var scenarioConcept = window.mentalmodeler.appModel.curSelection.conceptCollection.findWhere( {id:id} );
            if ( scenarioConcept ) {
                scenarioConcept.set( 'influence', value );
                this.debouncedRefreshScenario();
                //this.refreshScenario();
            }
        },
        // ----------------------------------------------------------------------

        refreshScenario: function() {
            //console.log('------refreshScenario');
            var curModel = window.mentalmodeler.appModel.curModel;
            this.log('refreshScenario, curModel:',curModel);
            if ( curModel && curModel.conceptCollection.length > 0 ) {
                this.log('curModel.conceptCollection:',curModel.conceptCollection );
                var scenarioData = curModel.getDataForScenarioCalculation();
                var sgModel = new ScenarioGraphModel( scenarioData, this.squashFunc );

                this.setActualStates(sgModel.getData());
                this.render();
                this.sgView.setModel( sgModel );
            }
        },

        setActualStates: function(sgData) {
            for(var i = 0; i < sgData.length; i++) {
                let id = sgData[i][2];
                let scenarioConcept = window.mentalmodeler.appModel.curSelection.conceptCollection.findWhere( {id:id} );

                if( scenarioConcept ) {
                    scenarioConcept.set('actualState', sgData[i][1]);
                }
            }
        },

        getStatePrediction: function() {
            let scenarioConcepts = window.mentalmodeler.appModel.curSelection.conceptCollection;

            let correctlyPredictedConcepts = scenarioConcepts.filter((concept) => {
                let actuState = concept.get('actualState');
                let prefState = concept.get('preferredState');
                return concept.get('selected') && !concept.get('influence') && prefState !== 0 && ((prefState > 0 && actuState > 0) || (prefState < 0 && actuState < 0));
            });

            let totalPredictedConcepts = scenarioConcepts.filter((concept) => {
                return concept.get('selected') && !concept.get('influence') && concept.get('preferredState') !== 0;
            });

            return 100 * (correctlyPredictedConcepts.length / totalPredictedConcepts.length);
        },

        onSelectedChange: function(e) {
            var $cb = $( e.target );
            var $tr = $cb.closest('tr');
            var id = $tr.attr('data-id');
            var value = e.target.checked;
            value ? $tr.removeClass('notIncludedInScenario') : $tr.addClass('notIncludedInScenario');
            var scenarioConcept = window.mentalmodeler.appModel.curSelection.conceptCollection.findWhere( {id:id} );
            //console.log('onSelectedChange,  $cb:', $cb,', id :',id,', value:',value,', typeof value:',typeof value,', scenarioConcept:',scenarioConcept);
            if ( scenarioConcept ) {
                scenarioConcept.set( 'selected', value );
                this.refreshScenario();
            }
        },

        onNameChange:function(e) {
            var curSelection = window.mentalmodeler.appModel.curSelection;
            if( curSelection ) {
                window.mentalmodeler.appModel.curSelection.set( 'name', this.$el.find('textarea#scenarioName').val() );
                Backbone.trigger( 'scenario:name-change' );
            }
        },

        onSquashChange: function(e) {
            this.squashFunc = $(e.target).val();
            this.refreshScenario();
        },

        render: function() {
            this.log( 'render, this.availableHeight:',this.availableHeight );
            var data = { concepts: [], name: '', squashFunc: this.squashFunc, prediction: NaN };
            var appModel = window.mentalmodeler.appModel;
            if ( appModel.curSelection != null && appModel.curSelectionType === 'scenario' ) {
                data.concepts = window.mentalmodeler.appModel.curSelection.getConceptsForScenario();
                data.name = window.mentalmodeler.appModel.curSelection.get('name');
                data.prediction = this.getStatePrediction();
                // console.log('\n______Scenario >  render' , '\n\tdata:', data);
            }
            this.$el.html( this.template( data ) );
            this.sgView.setElement( this.$el.find('div.panel-right') );

            // size table
            var $textarea = this.$el.find('textarea#scenarioName');
            var $select = this.$el.find('select#scenarioSquash');
            var $scenarioPrediction = this.$el.find('span#scenarioPrediction');
            var $scenarioTable = this.$el.find('#scenarioTable');
            var $table = this.$el.find('table');

            $scenarioTable.outerHeight( this.availableHeight - $textarea.outerHeight(true) - $select.outerHeight(true) - $scenarioPrediction.outerHeight(true) );
            // if table scrolls, add border to top and bottom
            if ( $table.height() > $scenarioTable.height() ) {
                $scenarioTable.addClass( 'hasOverflow' );
            }
            
            return this;
        },

        checkToRender: function( calledFrom ) {
            this.log( 'checkToRender, calledFrom:',calledFrom );
            var appModel = window.mentalmodeler.appModel;
            if ( appModel.curSelection !== null && appModel.curSelectionType === 'scenario' && appModel.curSection === 'scenario' ) {
                this.render();
                this.refreshScenario();
                //setTimeout( this.refreshScenario, 100);
            }
        },

        onSelectionChange: function() {
            this.checkToRender( 'onSelectionChange' );
        },

        onSectionChange: function() {
            this.checkToRender( 'onSectionChange' );
        },

        setHeight: function ( availableHeight ) {
            this.availableHeight = availableHeight
            this.render();
        }
    });

    return ScenarioView;
});
