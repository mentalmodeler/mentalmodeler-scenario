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
            this.listenTo( Backbone, 'mmp:remove', this.onModelAdded );
        },

        render: function() {
            var appModel =window.mentalmodeler.appModel; 
            var models =  appModel.get( 'mmps' );
            this.$el.html( this.template( { models: models.toJSON() } ) );
            this.renderList();
            this.setHeight();
            
            return this;
        },

        renderList: function() {
            var $body = this.$el.find( 'div.body' ); 
            $body.empty();
            var $holder = $('<div class="holder"></div>');
            var models =  window.mentalmodeler.appModel.get( 'mmps' );
            for (var i=0; i<models.length; i++) {
                var model = models.at(i);
                $holder.append( model.getView().render().el );
            }
            $body.append( $holder );
        },

        onModelAdded: function ( mmpModel ) {
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