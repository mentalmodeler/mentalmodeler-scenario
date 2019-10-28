/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'views/abstract',
    'text!templates/grid.html',
    'util/inputUtils'
], function ($, _, Backbone, Foundation, AbstractView, Template, InputUtils ) {
    'use strict';

    var GridView = AbstractView.extend({

        tagName: 'div',
        className: 'grid',
        template: _.template( $(Template).html() ),
        doLog: true,

        events: {
            'mousedown .mutable': 'showSlider',
            'input .slider': 'onSliderUpdate',
            'input .input': 'onTextInput',
            'blur .input': 'onTextInput',
            'change .slider': 'onSliderUpdate',
        },

        $currentSlider: null,

        initialize: function() {
            GridView.__super__.initialize.apply( this, arguments );

            this.listenTo( Backbone, 'selection:change', this.checkToRender );
            this.listenTo( Backbone, 'section:change', this.checkToRender );
            this.listenTo( Backbone, 'mmp:change', this.checkToRender );
        },

        showSlider: function( e ) {
            if ( this.$currentSlider !== null ) {
                this.$currentSlider.removeClass('shown');
            }
            this.$currentSlider = $(e.target).closest('td').find('.slider').addClass('shown');
            $(document).on( 'click.gridSlider',function( e ) {
                $(document).off( 'click.gridSlider' );
                var $slider = $(e.target).closest('td').find('.slider').addClass('shown');
                if ( !$slider.is(this.$currentSlider) ) {
                    if ( this.$currentSlider ) {
                        this.$currentSlider.removeClass('shown');
                    }
                    this.$currentSlider = null;
                }
            }.bind(this) );
        },

        onTextInput:function( e ) {
            var $input = $(e.currentTarget);
            var id = $input.closest( 'td' ).attr( 'data-id' );
            var influencerId = $input.closest( 'tr' ).attr( 'data-id' );
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
            this.updateValue( id, influencerId, v );
            $input.closest( 'td' ).find( '.slider' ).val( v );

        },

        onSliderUpdate: function( e ) {
            console.log('onSliderUpdate, e.type:',e.type);
            var $slider = $( e.target );
            var value = $slider.val();
            var $td = $slider.closest( 'td' );
            var $input = $td.find('.input').val( value );
            var id = $td.attr('data-id');
            var influencerId = $slider.closest('tr').attr('data-id');
            value === 0 ? $td.removeClass('hasValue') : $td.addClass('hasValue');
            if ( e.type === 'change' ) {
                //console.log('type is change, updateValue')
                this.updateValue( id, influencerId, value);
            }
        },

        updateValue: function ( id, influencerId, value ) {
            this.log( 'updateValue, value:',value,', id:',id,', influencerId:',influencerId );
            var curModel = window.mentalmodeler.appModel.curModel;
            if ( curModel ) {
                var influencer = curModel.conceptCollection.findWhere( {id: influencerId} );
                var influencee = curModel.conceptCollection.findWhere( {id: id} );
                if ( typeof influencer !== 'undefiend' ) {
                    this.log('     influencer:',influencer);
                    var relationships = influencer.relationshipCollection;
                    var relationship = relationships.findWhere( {id:id} );
                    if ( typeof relationship !== 'undefined' ) {
                        // relationship already exist
                        if ( value === '' ) {
                            // delete relationship since influence is removed
                            relationships.remove( relationship );
                        }
                        else {
                            // modify influence value
                            relationship.set( 'influence', value );
                        }
                        this.log('     relationships:',relationships);
                    }
                    else {
                        // create relationship
                        relationships.add( { id       : id,
                                             name     : influencee.get('name'),
                                             influence: value
                        });
                        this.log('     relationships:',relationships);
                    }
                }
            }
        },

        render: function() {
            var concepts = [];
            var curModel = window.mentalmodeler.appModel.curModel;
            if ( curModel ) {
                concepts = curModel.getConceptsForGrid();
            }
            this.$el.html( this.template( {concepts:concepts} ) );
            return this;
        },

        checkToRender: function() {
            var appModel = window.mentalmodeler.appModel;
            if ( appModel.curSelection != null && appModel.curSection === 'grid' ) {
                this.render();
            }
        }
    });

    return GridView;
});