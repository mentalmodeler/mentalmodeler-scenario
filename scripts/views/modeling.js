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
        doLog: true,
        logPrefix: '++++++++ ModelingView > ',

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
            var browserFamily = ua.browser.family ? ua.browser.family.toLowerCase() : "";
            var appModel = window.mentalmodeler.appModel;
            this.log('appModel:', appModel);
            if (window.MentalModelerUseFlash) {
                switch (browserFamily) {
                    case 'firefox':
                        this.$el.append("<embed id='flash-content' src='swf/mentalmodeler.swf' height='100%' width='100%' allowscriptaccess='always' allowfullscreeninteractive='true' type='application/x-shockwave-flash' />");
                        break;
                    default:
                        this.$el.append("<object id='flash-content' type='application/x-shockwave-flash' height='100%' width='100%'><param name='movie' value='swf/mentalmodeler.swf'/><param name='allowScriptAccess' value='always' /><param name='allowFullScreenInteractive' value='true' /></object>");
                }
                this.flash = this.$el.find('#flash-content')[0];
            } else {
                const div = document.querySelector('#flash-model');
                this.log('div:', this.$el[0]);
                window.MentalModelerConceptMap.render(this.$el[0]);
                // this.$el.append("<div>MAP</div>");
            }
            return this;
        },

        hasModelDiv: function() {
            return document && document.querySelector('#flash-model')     
        },

        getModelXML:function() {
            if (window.MentalModelerUseFlash && this.flash) {
                var xml = this.flash.doSave();
                return xml;
            }
        },

        reloadSwf:function( xml ) {
            if (window.MentalModelerUseFlash && this.flash) {
                this.flash.doLoad( xml );
            }
        },

        onSelectionChange: function( model, target, section ) {
            var appModel = window.mentalmodeler.appModel;
            this.log('onSelectionChange, appModel.curModel:', appModel.curModel);
            if ( appModel.curSection === 'modeling' && appModel.curModel ) {
                if (window.MentalModelerUseFlash) {
                    this.reloadSwf( appModel.curModel.getModelingXML() );
                }
            }
        },

        onSectionChange: function( section ) {
            var appModel = window.mentalmodeler.appModel;
            this.log('onSelectionChange, appModel.curModel:', appModel.curModel);
            if ( section === 'modeling' && appModel.curModel ) {
                if (window.MentalModelerUseFlash) {
                    this.reloadSwf( appModel.curModel.getModelingXML() );
                }
            }

        }
    });

    return ModelingView;
});
