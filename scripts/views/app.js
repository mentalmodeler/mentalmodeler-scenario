/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'views/abstract',
    'views/header',
    'views/list',
    'views/content',
    'text!templates/app.html',
    'util/displayUtils'
], function ($, _, Backbone, AbstractView, HeaderView, ListView, ContentView, Template, DisplayUtils ) {
    'use strict';

    var AppView = AbstractView.extend({
        el: '#app',
        headerView: null,
        listView: null,
        contentView: null,
        template: _.template( $(Template).html() ),
        resizeTimer: null,
        resizeDelay: 500, // milliseconds
        
        initialize: function() {
            AppView.__super__.initialize.apply( this, arguments );
            this.headerView = new HeaderView( {el: '#header'} );
            this.listView = new ListView();
            this.contentView = new ContentView();
        },

        render: function() {
            var that = this;
            this.headerView.render();
            this.$el.find( '#workspace' ).append( this.listView.render().el );
            this.$el.find( '#workspace' ).append( this.contentView.render().el );
            //$('body').append( this.el );
            var resizeScrollPanels = _.bind( this.resizeScrollPanels, this );
            $(document).ready( function() {
                // initialize dynamcially added foundation components
                $(document).foundation();
                resizeScrollPanels();
                window.onresize = function() {
                    if ( that.resizeTimer ) {
                        clearTimeout( that.resizeTimer );
                    }
                    that.resizeTimer = setTimeout( resizeScrollPanels, that.resizeDelay );
                }
            });
        },
        
        resizeScrollPanels: function() {
            //console.log('resizeScrollPanels');
            var vp = DisplayUtils.getViewportSize();
            
            var viewportHeight = vp.height; //$(window).height();
            /*
            if (window.innerWidth) {
                viewportHeight = window.innerHeight;
            } else {
                viewportHeight = document.body.clientHeight;
            }
            */
            var $workspace = this.$el.find( '#workspace' );
            var padding = parseInt( $workspace.css('padding-top'), 10 ) + parseInt( $workspace.css('padding-bottom'), 10 )
            var headerHeight = this.$el.find( '#header' ).outerHeight();
            var footerHeight = this.$el.find( '#footer' ).outerHeight();
            var availableHeight = viewportHeight - headerHeight - footerHeight - padding;
            // console.log( 'viewportHeight:',viewportHeight,', padding:',padding,', headerHeight:',headerHeight,', footerHeight:',footerHeight,', availableHeight:',availableHeight);
            $workspace.height( availableHeight );
            // set content vioew height first, because that sizes the tabs
            this.contentView.setHeight( availableHeight );
            this.listView.setAvailableHeight( availableHeight );
            Backbone.trigger('window:resize', { availableHeight: availableHeight } );
        }

    });

    return AppView;
});