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
            this.listenTo( Backbone, 'selection:change', this.selectionChange );
        },

        render: function() {
            this.$el.html( this.template( { model: this.model } ) );
            this.delegateEvents();
            if ( this.model.get( 'justAdded' ) === true ) {
                this.model.set( 'justAdded', false );
                this.$el.find( '.map' ).click();
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

        selectionChange:function ( model, target ) {
            var curModel = window.mentalmodeler.appModel.curModel;
            this.$el.removeClass( 'selected' );
            this.$el.find( '.map' ).removeClass( 'selected' );
            this.$el.find( '.scenario' ).removeClass( 'selected' );
            //console.log('selectionChange, model:',model,', target:',target,', curModel === this.model:',curModel === this.model );
            if ( curModel === this.model ) {
                var $elem = this.$el.find( target );
                $elem.addClass( 'selected' );
                $elem.closest( '.mmp' ).addClass( 'selected' );
            }
        },
        
        selectMap: function (e) {
            this.onSelect( e.target, 'modeling' );
            //console.log('selectMap');
        },

        selectScenario: function (e) {
            this.onSelect( e.target, 'scenario' );
            //console.log('selectScenario');
        },

        onSelect: function( target, section ) {
            window.mentalmodeler.appModel.selectionChange( this.model, target, section );          
        }
    });

    return MmpView;
});