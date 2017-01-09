/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'views/abstract',
    'detect'
], function ($, _, Backbone, Foundation, AbstractView, Detect) {
    'use strict';

    var ModelingView = AbstractView.extend({

        tagName: 'div',
        id: 'flash-model',
        flash: null,

        events: {
        },

        initialize: function() {
            ModelingView.__super__.initialize.apply( this, arguments );
            window.mentalmodeler.appModel.modelingView = this;
            this.listenTo( Backbone, 'selection:change', this.onSelectionChange );
            this.listenTo( Backbone, 'section:change', this.onSectionChange );
        },

        render: function() {
            var ua = Detect.parse( navigator.userAgent );
            switch ( ua.browser.family.toLowerCase() ) {
            case 'firefox':
                this.$el.append("<embed id='flash-content' src='swf/mentalmodeler.swf' height='100%' width='100%' allowscriptaccess='always' allowfullscreeninteractive='true' type='application/x-shockwave-flash' />");
                break;
            default:
                this.$el.append("<object id='flash-content' type='application/x-shockwave-flash' height='100%' width='100%'><param name='movie' value='swf/mentalmodeler.swf'/><param name='allowScriptAccess' value='always' /><param name='allowFullScreenInteractive' value='true' /></object>");
            }

            this.flash = this.$el.find('#flash-content')[0];
            return this;
        },

        getModelXML:function() {
            var xml = this.flash.doSave();
            return xml;
        },

        reloadSwf:function( xml ) {
            this.flash.doLoad( xml );
        },

        onSelectionChange: function( model, target, section ) {
            //console.log('ModelingView > onSelectionChange, model:',model,', target:',target,', section:',section);
            var appModel = window.mentalmodeler.appModel;
            if ( appModel.curSection === 'modeling' && appModel.curModel ) {
                this.reloadSwf( appModel.curModel.getModelingXML() );
            }
        },

        onSectionChange: function( section ) {
            //console.log('ModelingView > onSelectionChange');
            var appModel = window.mentalmodeler.appModel;
            if ( section === 'modeling' && appModel.curModel ) {
                this.reloadSwf( appModel.curModel.getModelingXML() );
            }

        }
    });

    return ModelingView;
});
