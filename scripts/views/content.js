/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'views/abstract',
    'views/modeling',
    'views/grid',
    'views/info',
    'views/scenario',
    'text!templates/content.html'
], function ($, _, Backbone, Foundation, AbstractView, ModelingView, GridView, InfoView, ScenarioView, Template) {
    'use strict';

    var ContentView = AbstractView.extend({
        
        tagName: 'div',
        className: 'right-main app-panel',
        template: _.template( $(Template).html() ),
        modelingView: null,
        gridView: null,
        infoView: null,
        scenarioView: null,
        contentPanelHeight: 0,
        events: {
        },
        
        initialize: function() {
            ContentView.__super__.initialize.apply( this, arguments );
            
            this.modelingView = new ModelingView();
            this.gridView = new GridView();
            this.infoView = new InfoView();
            this.scenarioView = new ScenarioView();

            this.listenTo( Backbone, 'selection:change', this.onSelectionChange );
            this.listenTo( Backbone, 'section:change', this.onSectionChange );
        },

        render: function() {
            var that = this;
            this.$el.html( this.template( {} ) );
            
            // populate tab panel content
            this.$el.find('div.tabs-content #panel-modeling').html( this.modelingView.render().el );
            this.$el.find('div.tabs-content #panel-grid').html( this.gridView.render().el );
            this.$el.find('div.tabs-content #panel-info').html( this.infoView.render().el );
            this.$el.find('div.tabs-content #panel-scenario').html( this.scenarioView.render().el );
            
            // override default tab click functionality
            this.$el.find('.tabs').on('click', function (e) {
                var $target = $(e.target);
                if ( $target.is('i') ) {
                    $target = $target.closest('a');
                }
                var section = $target[0].href.split('-')[1];
                window.mentalmodeler.appModel.setSection( section );
                that.updateContentPanel( section );    
                
                // prevent click from propogating
                e.preventDefault();                
                return false;
            });
            return this;
        },

        updateSection:function (section) {
            window.mentalmodeler.appModel.setSection( section );
            this.updateContentPanel( section );        
        },

        onSelectionChange: function( model, target, section ) {
            //console.log('ContentView > onSelectionChange, model:',model,', target:',target,', section:', section);
            
            // simulate a tab click
            if (typeof section !== 'undefined' ) {
                this.$el.find( 'a[href="#panel-' + section + '"]' ).click();
            }
        },

        onSectionChange: function( section ) {
            //console.log('ContentView > onSectionChange, section:', section);
            
            // update the current selected tab display
            this.$el.find('.tabs > dd').each( function (index, elem) {
                var $this = $(this);
                var $a = $this.find('a');
                var id = $a.attr('href').split('-')[1];
                section === id ? $this.addClass('active') : $this.removeClass('active');
            });

            this.$el.find('div.content').each( function() {                
                var $this = $(this);
                var id = $this.attr('id').split('-')[1];
                section === id ? $this.addClass('active') : $this.removeClass('active');

                // special treatment for modeling section necause of embedded .swf
                if ( id === "modeling" ) {
                    $this.css( 'visibility', id === section ? 'visible' : 'hidden' );    
                }
                else {
                    (id === section) ? $this.css('display', 'block') : $this.css('display', 'none');
                }
                $this.css( 'z-index', id === section ? 10 : 0 );
            });
        },

        updateContentPanel: function( activeId ) {
            var that = this;
            var useActive = ( typeof activeId === 'undefined' );
            this.$el.find('div.content').each( function() {                
                var $this = $(this);
                var id = $this.attr('id');
                var h = that.contentPanelHeight;
                // panel-modeling height is set to 0 when not active instead of display:none so .swf is not reset
                if ( id === 'panel-modeling' && (( useActive && $this.hasClass('active') === false ) || ( useActive === false && activeId !== 'modeling' )) ) {
                        h = 0;
                }
                $this.height( h );
            });
        },

        setHeight: function( availableHeight ) {
            var tabHeight = this.$el.find('.tabs').outerHeight();
            var padding = parseInt( this.$el.find('div.tabs-content').css( 'padding-top' ), 10 ) + parseInt( this.$el.find('div.tabs-content').css( 'padding-bottom' ), 10 );
            this.contentPanelHeight = availableHeight - tabHeight - padding
            this.$el.find('div.tab-content').height( availableHeight );
            
            //console.log('setHeight, availableHeight:',availableHeight,', tabHeight:',tabHeight,', padding:',padding );
            this.updateContentPanel();
        },

        getActivePanel:function () {
            this.$el.find('div.tabs-content div.content.active');
        }
    });

    return ContentView;
});