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

        events: {
            'click .map' : 'selectMap',
            'click .scenario' : 'selectScenario',
            'click .scenarios-header' : 'toggleScenarios'
        },
        
        initialize: function() {
            MmpView.__super__.initialize.apply( this, arguments );
            this.listenTo( Backbone, 'selection:change', this.onSelectionChange );
        },

        render: function() {
            console.log('MmpView > render, this.model:',this.model );

            this.$el.html( this.template( { model: this.model } ) );
            this.delegateEvents();
            
            // for models that are just added, select that model and the modeing view
            if ( this.model.get( 'justAdded' ) === true ) {
                this.model.set( 'justAdded', false );
                this.$el.find( '.map' ).click();
            }
            else {
                this.onSelectionChange();
            }

            return this;
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

        onSelectionChange:function ( model, target ) {
            //console.log('--- mmp > onSelectionChange');
            var curModel = window.mentalmodeler.appModel.curModel;
            this.$el.removeClass( 'selected' );
            this.$el.find( '.map' ).removeClass( 'selected' );
            this.$el.find( '.scenario' ).removeClass( 'selected' );
            //console.log('selectionChange, model:',model,', target:',target,', curModel === this.model:',curModel === this.model );
            if ( curModel === this.model ) {
                var $elem;
                if (typeof target !== 'undefined') {
                    $elem = this.$el.find( target );
                }
                else {
                    $elem = this.$el.find( '.map' );
                }
                $elem.addClass( 'selected' );
                $elem.closest( '.mmp' ).addClass( 'selected' );
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
            window.mentalmodeler.appModel.selectionChange( this.model, target, section );          
        }
    });

    return MmpView;
});