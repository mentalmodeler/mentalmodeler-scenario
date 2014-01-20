/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'views/abstract',
    'views/header',
    'models/header',
    'views/list',
    'models/list',
    'views/content',
    'models/content',
    'text!templates/app.html'
], function ($, _, Backbone, AbstractView, HeaderView, HeaderModel, ListView, ListModel, ContentView, ContentModel, Template ) {
    'use strict';

    var AppView = AbstractView.extend({
        el: '#app',
        headerView: null,
        listView: null,
        contentView: null,
        template: _.template( $(Template).html() ),
        
        initialize: function() {
            AppView.__super__.initialize.apply( this, arguments );
            this.headerView = new HeaderView( {model: new HeaderModel(), el: '#header'} );
            this.listView = new ListView( {model: new ListModel()} );
            this.contentView = new ContentView( {model: new ContentModel()} );
        },

        render: function() {
            var that = this;
            this.headerView.render();
            this.$el.find( '#workspace' ).append( this.listView.render().el );
            this.$el.find( '#workspace' ).append( this.contentView.render().el );
            //$('body').append( this.el );
            var resizeScrollPanels = _.bind( this.resizeScrollPanels, this );
            $(document).ready( function() {
                window.onresize = resizeScrollPanels;
                // initialize dynamcially added foundation components
                $(document).foundation();
                resizeScrollPanels();  
            });
        },
        
        resizeScrollPanels: function() {
            var viewportHeight = $(window).height();
            if (window.innerWidth) {
                viewportHeight = window.innerHeight;
            } else {
                viewportHeight = document.body.clientHeight;
            }
            var $workspace = this.$el.find( '#workspace' );
            var padding = parseInt( $workspace.css('padding-top'), 10 ) + parseInt( $workspace.css('padding-bottom'), 10 )
            var headerHeight = this.$el.find( '#header' ).outerHeight();
            var footerHeight = this.$el.find( '#footer' ).outerHeight();
            var availableHeight = viewportHeight - headerHeight - footerHeight - padding;
            // console.log( 'viewportHeight:',viewportHeight,', padding:',padding,', headerHeight:',headerHeight,', footerHeight:',footerHeight,', availableHeight:',availableHeight);
            $workspace.height( availableHeight );
            this.$el.find('.app-panel').each( function() {
                //$(this).css( 'min-height', availableHeight );
            });
            this.listView.setAvailableHeight( availableHeight );
            this.contentView.setHeight( availableHeight );
            Backbone.trigger('window:resize', { availableHeight: availableHeight } );
        }
  
    });

    return AppView;
});