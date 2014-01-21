/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'views/abstract',
    'views/modeling',
    'views/grid',
    'models/abstract',
    'text!templates/content.html'
], function ($, _, Backbone, Foundation, AbstractView, ModelingView, GridView, AbstractModel, Template) {
    'use strict';

    var ContentView = AbstractView.extend({
        
        tagName: 'div',
        className: 'right-main app-panel',
        template: _.template( $(Template).html() ),
        modelingView: null,
        gridView: null,
        contentPanelHeight: 0,
        events: {
        },
        
        initialize: function() {
            ContentView.__super__.initialize.apply( this, arguments );
            this.modelingView = new ModelingView( { /*model:new AbstractModel()*/ } );
            this.gridView = new GridView( { /*model:new AbstractModel()*/ } );
            this.listenTo( Backbone, 'selection:change', this.onSelectionChange );
            this.listenTo( Backbone, 'section:change', this.onSectionChange );
        },

        render: function() {
            var that = this;
            this.$el.html( this.template( {} ) );
            // populate tab panel content
            this.$el.find('div.tabs-content #panel-modeling').html( this.modelingView.render().el );
            this.$el.find('div.tabs-content #panel-grid').html( this.gridView.render().el );
            
            // override default tab click functionality
            this.$el.find('.tabs').on('click', function (e) {
                var section = e.target.href.split('-')[1];
                window.mentalmodeler.appModel.setSection( section );
                that.updateContentPanel( that.contentPanelHeight, section );
                e.preventDefault();                
                return false;
            });
            return this;
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

        updateContentPanel: function( h, activeId ) {
            
            var useActive = true;
            if ( typeof activeId !== 'undefined' ) {
                //window.mentalmodeler.appModel.setSection( activeId.split('-')[1] );
                useActive = false;
            }
            //console.log('updateContentPanel, h:',h,', activeId:',activeId);
            

            //var useActive = typeof activeId === 'undefined';
            this.$el.find('div.content').each( function() {                
                var $this = $(this);
                var id = $this.attr('id');
                if ( id === 'panel-modeling' ) {
                    if ( (useActive && $this.hasClass('active') === false) || (useActive === false && activeId !== 'modeling') ) {
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
            //console.log('setHeight, availableHeight:',availableHeight,', tabHeight:',tabHeight,', padding:',padding );
            this.updateContentPanel( this.contentPanelHeight );
        },

        getActivePanel:function () {
            this.$el.find('div.tabs-content div.content.active');
        }
    });

    return ContentView;
});