/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'views/abstract',
    'text!templates/mmp.html'
], function ($, _, Backbone, Foundation, AbstractView, Template) {
    'use strict';

    var MmpView = AbstractView.extend({
        
        tagName: 'div',
        className: 'mmp',
        template: _.template( $(Template).html() ),
        doLog: false,
        logPrefix: '\n----- MmpView > ',

        events: {
            'click .map' : 'selectMap',
            'click .scenario' : 'selectScenario',
            'click .scenarios-header' : 'toggleScenarios',
            'click .scenarios-header > button' : 'addScenario'
        },
        
        initialize: function() {
            MmpView.__super__.initialize.apply( this, arguments );
            this.listenTo( Backbone, 'selection:change', this.onSelectionChange );
            this.listenTo( Backbone, 'info:change', this.render );
            this.listenTo( Backbone, 'scenario:name-change', this.render );
            //console.log('this.model:',this.model);
            //this.listenTo( this.model, 'mmp:scenarioschange', this.onScenarioChange );
        },

        render: function() {
            //console.log('MmpView > render, this.model:',this.model );

            this.$el.html( this.template( { model: this.model } ) );
            this.delegateEvents();
            
            // for models that are just added, select that model and the modeling view
            if ( this.model.get( 'justAdded' ) === true ) {
                this.model.set( 'justAdded', false );
                this.$el.find( '.map' ).click();
            }
            else {
                this.onSelectionChange();
            }

            return this;
        },

        close: function() {
            // not needed? backbonejs remove should call stopListening and $.empty
            /* 
            this.undelegateEvents();
            this.stopListening();
            this.$el.empty();
            */
            this.remove();
        },

        onScenariosChange: function() {
            this.render();
        },

        addScenario: function( e ) {
            e.preventDefault();
            this.model.addScenario();
            return false;
        },

        toggleScenarios: function(e) {
            var $header = $( e.target );
            var $list = this.$el.find( '.scenarios-list' );
            var $iconExpand = this.$el.find( 'i.expand');
            var $iconCollapse = this.$el.find( 'i.collapse');
            var expanded = $list.hasClass('expanded');
            if ( expanded ) {
                $iconExpand.hide();
                $iconCollapse.show();
                $list.hide();
                $list.removeClass('expanded');
            }
            else {
                $iconExpand.show();
                $iconCollapse.hide();
                $list.show();
                $list.addClass('expanded');    
            }
        },

        findTarget: function ( curSelection, curSelectionType, target ) {
            var $elem;
            if (typeof target !== 'undefined') {
                $elem = this.$el.find( target );
            }
            else if ( curSelection && curSelectionType ) {
                // find the target based on the curSelection type and its index
                if ( curSelectionType === 'mmp' ) {
                    // map files targets are easy because there is only one per view
                    $elem = this.$el.find( '.map' );    
                }
                else {
                    // scenario targets require use to check against the selected scenario index
                    // to know what target to select
                    var idx = curSelection.collection.indexOf( curSelection );
                    if ( idx !== -1 ) {
                        $elem = this.$el.find( '.scenario:nth-child('+(idx+1)+')' );
                    }
                }
            }
            return $elem;
        },

        onSelectionChange:function ( model, target ) {
            var appModel = window.mentalmodeler.appModel;
            var curModel = appModel.curModel;
            var curSelectionType = appModel.curSelectionType;
            var curSelection = appModel.curSelection;
            this.$el.removeClass( 'selected' );
            this.$el.find( '.map' ).removeClass( 'selected' );
            this.$el.find( '.scenario' ).removeClass( 'selected' );
            this.log('selectionChange, model:',model,', target:',target,', curModel === this.model:',curModel === this.model,', curSelection:',curSelection,', curSelectionType:', curSelectionType);
            if ( curModel === this.model ) { 
                // this model is selected
                var $elem;
                if ( curSelection === null) 
                {
                    // something was removed
                }
                else {
                    // selection changed or something was added. find the right target
                    $elem = this.findTarget( curSelection, curSelectionType, target);
                }
                
                if ( $elem ) {
                    // select the target elem
                    $elem.addClass( 'selected' );
                    // highlight the parent model ui group as having a selected target
                    $elem.closest( '.mmp' ).addClass( 'selected' );    
                }
            }
        },
        
        selectMap: function (e) {
            //console.log('MmpView > selectMap, e.target:',e.target);
            this.onSelect( e.target, 'modeling' );
        },

        selectScenario: function (e) {
            //console.log('MmpView > selectScenario,', ' e.target:',e.target);
            this.onSelect( e.target, 'scenario' );
        },

        onSelect: function( target, section ) {
            var curSection = window.mentalmodeler.appModel.curSection;
            this.log('onSelect'
                , '\n\tsection:', section
                , '\n\tcurSection:', curSection
                // , '\n\twindow.mentalmodeler.appModel:', window.mentalmodeler.appModel
                // , ',\n\tthis.model:',this.model
            );
            window.mentalmodeler.appModel.selectionChange( this.model, target, section );
            // if ( section === 'scenario' && window.mentalmodeler.appModel.curSelectionType !== 'scenario' ) {
            //     window.mentalmodeler.appModel.setSection( section );
            // } else {
            //     window.mentalmodeler.appModel.selectionChange( this.model, target, section );          
            // }
        }
    });

    return MmpView;
});