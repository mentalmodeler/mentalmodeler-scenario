/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'views/abstract',
    'views/modeling',
    'models/abstract',
    'text!templates/content.html'
], function ($, _, Backbone, Foundation, AbstractView, ModelingView, AbstractModel, Template) {
    'use strict';

    var ContentView = AbstractView.extend({
        
        tagName: 'div',
        className: 'right-main app-panel',
        template: _.template( $(Template).html() ),
        modelingView: null,
        contentPanelHeight: 0,
        events: {
        },
        
        initialize: function() {
            ContentView.__super__.initialize.apply( this, arguments );
            this.modelingView = new ModelingView( { model:new AbstractModel() } );
             this.listenTo( Backbone, 'selection:change', this.onSelectionChange );
        },

        render: function() {
            var that = this;
            this.$el.html( this.template( {} ) );
            var modeling = this.$el.find('div.tabs-content #panel-modeling').html( this.modelingView.render().el );
            this.$el.find('.tabs').on('click', function (e) {
                that.updateContentPanel( that.contentPanelHeight, e.target.href.split('#')[1] );
            });
            return this;
        },

        onSelectionChange: function( model, target, section ) {
            this.$el.find( 'a[href="#panel-' + section + '"]' ).click();
        },

        updateContentPanel: function( h, activeId ) {
            var useActive = true;
            if ( typeof activeId !== 'undefined' ) {
                window.mentalmodeler.appModel.setCurSection( activeId.split('-')[1] );
                useActive = false;
            }
            //var useActive = typeof activeId === 'undefined';
            this.$el.find('div.content').each( function() {                
                var $this = $(this);
                var id = $this.attr('id');
                if ( id === 'panel-modeling' ) {
                    if ( (useActive && $this.hasClass('active') === false) || (useActive === false && activeId !== 'panel-modeling') ) {
                        $this.height( 0 );
                    }
                    else {
                        $this.height( h );
                    }
                }
                else {
                    $this.height( h );
                }
            });
        },

        setHeight: function( availableHeight ) {
            var tabHeight = this.$el.find('.tabs').outerHeight();
            var padding = parseInt( this.$el.find('div.tabs-content').css( 'padding-top' ), 10 ) + parseInt( this.$el.find('div.tabs-content').css( 'padding-bottom' ), 10 );
            this.contentPanelHeight = availableHeight - tabHeight - padding
            this.$el.find('div.tab-content').height( availableHeight );
            this.updateContentPanel( this.contentPanelHeight );
            //console.log('setHeight, availableHeight:',availableHeight,', tabHeight:',tabHeight,', padding:',padding );
        },

        getActivePanel:function () {
            this.$el.find('div.tabs-content div.content.active');
        }
    });

    return ContentView;
});