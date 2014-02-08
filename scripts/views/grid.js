/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'views/abstract',
    'text!templates/grid.html',
], function ($, _, Backbone, Foundation, AbstractView, Template ) {
    'use strict';

    var GridView = AbstractView.extend({
        
        tagName: 'div',
        className: 'grid',
        template: _.template( $(Template).html() ),
        doLog: false,

        events: {
            'change select': 'onInfluenceChange'
        },
        
        initialize: function() {
            GridView.__super__.initialize.apply( this, arguments );
            
            this.listenTo( Backbone, 'selection:change', this.checkToRender );
            this.listenTo( Backbone, 'section:change', this.checkToRender );
            this.listenTo( Backbone, 'mmp:change', this.checkToRender );
        },

        onInfluenceChange: function( e ) {
            var $select = $( e.target );
            var value = $select.find('option:selected').val();
            value !== '' ? $select.addClass('hasValue') : $select.removeClass('hasValue');

            

            var id = $select.closest('td').attr('data-id');
            var influencerId = $select.closest('tr').attr('data-id');
            this.log( 'onInfluenceChange, value:',value,', id:',id,', influencerId:',influencerId );
            
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
            //this.$el.find('table.responsive').responsiveTable();
            //$(document).foundation();
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