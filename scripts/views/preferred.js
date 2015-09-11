/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'views/abstract',
    'models/mmp',
    'text!templates/preferred.html'
], function ($, _, Backbone, Foundation, AbstractView, MmpModel, Template) {
    'use strict';

    var PreferredView = AbstractView.extend({

        tagName: 'div',
        className: 'preferred row',
        template: _.template( $(Template).html() ),
        availableHeight: 0,
        doLog: false,
        logPrefix: '-*-*- PreferrredView > ',

       events: {
            'change select': 'onPreferredChange',
        },

        initialize: function() {
            this.log('initialize');
            //_.bindAll( this, 'refreshScenario' );
            PreferredView.__super__.initialize.apply( this, arguments );
            this.listenTo( Backbone, 'selection:change', this.onSelectionChange );
            this.listenTo( Backbone, 'section:change', this.onSectionChange );
        },


        onPreferredChange: function(e) {
            var $select = $( e.target );
            var $tr = $select.closest('tr');
            var id = $tr.attr('data-id');
            var value = $select.find('option:selected').val();
            value = !_.isEmpty(value) ? parseFloat(value) : 0;
            //console.log('onPreferredChange > value:',value,', typeof value:',typeof value);
            if ( value !== 0 ) {
                $select.addClass('hasValue');
                $tr.addClass('hasValue');
            }
            else {
                $select.removeClass('hasValue');
                $tr.removeClass('hasValue');
            }

            var concept = window.mentalmodeler.appModel.curModel.conceptCollection.findWhere( {id:id} );
            if ( concept ) {
                concept.set('preferredState', value);
            }
        },


        render: function() {
            var data = { concepts: [] };
            var appModel = window.mentalmodeler.appModel;
            if ( appModel.curModel !== null && appModel.curSection === 'preferred' ) {
                data.concepts = appModel.curModel.conceptCollection.toJSON();
            }

            this.$el.html( this.template( data ) );

            // size table
            var $preferredTable = this.$el.find('#preferredTable');
            var $table = this.$el.find('table');
            $preferredTable.outerHeight( this.availableHeight );
            // if table scrolls, add border to top and bottom
            if ( $table.height() > $preferredTable.height() ) {
                $preferredTable.addClass( 'hasOverflow' );
            } else {
                $preferredTable.removeClass( 'hasOverflow' );
            }
            this.$el.find('.panel-right').outerHeight( this.availableHeight );;

            return this;
        },

        checkToRender: function( calledFrom ) {
            var appModel = window.mentalmodeler.appModel;
            if ( appModel.curModel !== null && appModel.curSection === 'preferred' ) {
                this.render();
            }
        },

        onSelectionChange: function() {
            this.checkToRender( 'onSelectionChange' );
        },

        onSectionChange: function() {
            this.checkToRender( 'onSectionChange' );
        },

        setHeight: function ( availableHeight ) {
            this.availableHeight = availableHeight;
            this.render();
        }
    });

    return PreferredView;
});
