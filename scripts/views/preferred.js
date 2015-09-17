/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'views/abstract',
    'models/mmp',
    'text!templates/preferred.html',
    'text!templates/type-filter.html'
], function ($, _, Backbone, Foundation, AbstractView, MmpModel, ViewTemplate, TypeFilterTemplate) {
    'use strict';

    var PreferredView = AbstractView.extend({

        tagName: 'div',
        className: 'preferred row',
        template: _.template( $(ViewTemplate).html() ),
        filterTemplate: _.template( $(TypeFilterTemplate).html() ),
        availableHeight: 0,
        doLog: false,
        logPrefix: '-*-*- PreferrredView > ',
        sortOn: '',
        sortType: '',
        filterTypes: ['driver', 'receiver', 'ordinary'],
        metrics: {},
        metricsConceptsSorted: [],
        filter: {
            shown: false,
            values: [ 'ordinary', 'driver', 'receiver' ]
        },

       events: {
            'change select': 'onPreferredChange',
            'click .sortable': 'onSortableChange',
            'click .filterable': 'showTypeFilter',
            'change .type-filter input' : 'onTypeFilterChange'
        },

        initialize: function() {
            this.log('initialize');
            //_.bindAll( this, 'refreshScenario' );
            PreferredView.__super__.initialize.apply( this, arguments );
            this.listenTo( Backbone, 'selection:change', this.onSelectionChange );
            this.listenTo( Backbone, 'section:change', this.onSectionChange );
        },

        onTypeFilterChange: function( e ) {
            var values = [];
            _.each( this.$el.find('input:checked'), function( elem ){
                values.push( $(elem).attr('value') );
            });
            this.filter.values = values;
            this.sortTableData(true);
        },

        showTypeFilter: function( f ) {
            if ( !this.$typeFilter ) {
                this.$typeFilter = $( this.filterTemplate() ).appendTo( this.$el );
            } else if ( !$.contains(this.$el[0], this.$typeFilter[0] )) {
                this.$typeFilter.appendTo( this.$el );
                //this.delegateEvents();
            }
            //this.$typeFilter = this.$('.type-filter').css('display', 'block');
            this.filter.shown = true;
            this.updateFilter();
            $(document).on('mousedown.type-filter', function( e ) {
                if ( !$(e.target).is('.type-filter') && !$(e.target).is('.type-filter *') ) {
                    this.filter.shown = false;
                    if ( this.$typeFilter ) {
                        this.$typeFilter.css('display', 'none');
                        this.$typeFilter.remove();
                    }
                    this.$typeFilter = null;
                    $(document).off('mousedown.type-filter');
                }
            }.bind(this));
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
            if ( this.filter.values.length === 3 ) {
                filteredConcepts = concepts;
            } else {
                var groups = _.groupBy( concepts, 'type');
                _.each( this.filter.values, function( type ) {
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
                if ( this.filter.shown ) {
                    this.showTypeFilter();
                }
            }
        },

        updateFilter: function() {
            _.each( this.$('.type-filter input'), function( input ) {
                var $input = $(input);
                var val = $input.val()
                input.checked = this.filter.values.indexOf(val) > -1;
            }.bind(this) );
        },

        render: function() {
            var appModel = window.mentalmodeler.appModel;
            if ( appModel.curModel !== null && appModel.curSection === 'preferred' ) {
                this.metrics = appModel.curModel.getStructuralMetrics();
            }
            this.sortTableData();
            this.$el.html( this.template( {metrics: this.metrics, concepts:this.metricsConceptsSorted, sort:{on:this.sortOn, type:this.sortType} } ) );
            if ( this.filter.shown ) {
                this.showTypeFilter();
            }
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
