/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'views/abstract',
    'text!templates/list.html'
], function ($, _, Backbone, Foundation, AbstractView, Template) {
    'use strict';

    var ListView = AbstractView.extend({
        
        tagName: 'div',
        className: 'left-main app-panel',
        template: _.template( $(Template).html() ),
        availableHeight: null,

        events: {
        },
        
        initialize: function() {
            ListView.__super__.initialize.apply( this, arguments );
            this.listenTo( Backbone, 'mmp:add', this.onModelAdded );
            this.listenTo( Backbone, 'mmp:remove', this.onModelRemoved );
            this.listenTo( Backbone, 'scenario:remove', this.onScenarioRemoved );
        },

        render: function() {
            this.$el.html( this.template() );
            this.renderList();
            this.setHeight();
            
            return this;
        },

        renderList: function() {
            var $body = this.$el.find( 'div.body' ); 
            $body.empty();
            var $holder = $('<div class="holder"></div>');
            var models =  window.mentalmodeler.appModel.mmps;
            for (var i=0; i<models.length; i++) {
                var model = models.at(i);
                $holder.append( model.getView().render().el );
            }
            $body.append( $holder );
        },

        onModelAdded: function ( mmpModel ) {
            //console.log( 'ListView > onModelAdded');
            this.renderList();
        },

        onModelRemoved: function ( mmpModel ) {
            //console.log( 'ListView > onModelRemoved');
            this.renderList();
        },

        onScenarioRemoved: function ( mmpModel ) {
            console.log( 'ListView > onScenarioRemoved');
            this.renderList();
        },

        setAvailableHeight: function( availableHeight ) {
            this.availableHeight = availableHeight;
            if ( this.availableHeight !== null && this.availableHeight > 0 ) {
                this.setHeight();
            }
        },

        setHeight: function() {
            var $header = this.$el.find('.header');
            var $body = this.$el.find('.body');
            var headerHeight = $header.outerHeight();
            var bodyPadding = parseInt( $body.css('padding-top'), 10) * 2;
            //console.log( 'this.availableHeight:',this.availableHeight,', headerHeight:',headerHeight,' bodyPadding:',bodyPadding)
            $body.height( this.availableHeight - (headerHeight + bodyPadding) );
        }
    });

    return ListView;
});