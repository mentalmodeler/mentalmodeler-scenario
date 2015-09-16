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
        sortOn: '',
        sortType: '',
        filterTypes: ['driver', 'receiver', 'ordinary'],
        metrics: {},
        metricsConceptsSorted: [],

       events: {
            'change select': 'onPreferredChange',
            'click .sortable': 'onSortableChange',
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
            var appModel = window.mentalmodeler.appModel;
            var concept = appModel.curModel.conceptCollection.findWhere( {id:id} );
            if ( concept ) {
                concept.set('preferredState', value);
                // update metrics data
                if ( appModel.curModel !== null ) {
                   this.metrics = appModel.curModel.getStructuralMetrics();
                }
            }
        },

        onSortableChange:function( e ) {
            var $elem = $(e.target);
            var sort = $elem.data('sort');
            if ( sort === this.sortOn ) {
                this.sortType = (this.sortType === 'ascending') ? 'descending' : 'ascending';
            } else {
                this.sortType = 'descending';
                this.sortOn = sort;
            }
            this.sortTableData(true);
        },

        filterGroups: function( concepts ) {
            var filteredConcepts = [];
            if ( this.filterTypes.length === 3 ) {
                filteredConcepts = concepts;
            } else {
                var groups = _.groupBy( concepts, 'type');
                console.log('groups:',groups);
                _.each( this.filterTypes, function( type ) {
                    console.log('type:',type);
                    if ( groups[type] ) {
                        filteredConcepts = filteredConcepts.concat( groups[type] );
                    }
                });
            }
            return filteredConcepts;
        },

        sortTableData: function( render ) {
            var filteredConcepts = this.filterGroups( this.metrics.concepts || [] );
            if ( _.isString(this.sortOn) && !_.isEmpty(this.sortOn) ) {
                filteredConcepts = _.sortBy( filteredConcepts, this.sortOn );
                if ( this.sortType === 'descending' ) {
                    filteredConcepts.reverse();
                }
            }

            this.metricsConceptsSorted = filteredConcepts;
            if ( render === true ) {
                this.$el.html( this.template( {metrics: this.metrics, concepts:this.metricsConceptsSorted, sort:{on:this.sortOn, type:this.sortType}} ) );
                this.sizeTables();
            }
        },

        render: function() {
            var appModel = window.mentalmodeler.appModel;

            if ( appModel.curModel !== null && appModel.curSection === 'preferred' ) {
                this.metrics = appModel.curModel.getStructuralMetrics();
            }
            this.sortTableData();
            this.$el.html( this.template( {metrics: this.metrics, concepts:this.metricsConceptsSorted, sort:{on:this.sortOn, type:this.sortType} } ) );

            // size tables
            this.sizeTables()

            return this;
        },

        sizeTables: function() {
            var $pref = this.$el.find( '#pref-right-panel' );
            $pref.outerHeight( this.availableHeight );
            ( $pref.find('table').height() > $pref.height() ) ? $pref.addClass( 'hasOverflow' ) : $pref.removeClass( 'hasOverflow' );

            $pref = this.$el.find( '#pref-left-panel' );
            $pref.outerHeight( this.availableHeight );
            var $wrap = $pref.find( '.metricsWrapper' );
            $wrap.outerHeight( this.availableHeight );
            var contentHeight = 0;
            _.each( $wrap.find('table'), function (table) {
                contentHeight += $(table).outerHeight(true);
            });
            ( contentHeight > $wrap.height() ) ? $wrap.addClass( 'hasOverflow' ) : $wrap.removeClass( 'hasOverflow' );
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
