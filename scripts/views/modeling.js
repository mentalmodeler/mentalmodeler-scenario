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
        doLog: false,
        logPrefix: '\n++++++++ ModelingView > ',

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
                window.MentalModelerConceptMap.render(this.$el[0]);
            }
            return this;
        },

        getModelXML:function() {
            if (window.MentalModelerUseFlash && this.flash) {
                var xml = this.flash.doSave();
                return xml;
            }
        },

        getModelJS:function() {
            if (window.MentalModelerConceptMap && window.MentalModelerConceptMap.save) {
                // data = {js, json}
                var data = window.MentalModelerConceptMap.save();
                // console.log('\tgetModelJS\ndata:', data, '\n');
                return data;
            }
        },

        reloadSwf:function( xml ) {
            if (window.MentalModelerUseFlash && this.flash) {
                this.flash.doLoad( xml );
            }
        },

        onSelectionChange: function( model, target, section ) {
            var appModel = window.mentalmodeler.appModel;
            if ( appModel.curSection === 'modeling' && appModel.curModel ) {
                if (window.MentalModelerUseFlash) {
                    this.log('onSelectionChange, reloadSwf:', appModel.curModel.getModelingXML());
                    this.reloadSwf( appModel.curModel.getModelingXML() );
                } else if (window.MentalModelerConceptMap) {
                    this.log('onSelectionChange, load:', appModel.curModel.getModelingJSON());
                    window.MentalModelerConceptMap.load( appModel.curModel.getModelingJSON() )
                }
            }
        },

        onSectionChange: function( section ) {
            var appModel = window.mentalmodeler.appModel;
            if ( section === 'modeling' && appModel.curModel ) {
                if (window.MentalModelerUseFlash) {
                    this.log('onSectionChange, reloadSwf:', appModel.curModel.getModelingXML());
                    this.reloadSwf( appModel.curModel.getModelingXML() );
                } else if (window.MentalModelerConceptMap) {
                    this.log('onSectionChange, load:', appModel.curModel.getModelingJSON());
                    window.MentalModelerConceptMap.load( appModel.curModel.getModelingJSON() )
                }
            }

        }
    });

    return ModelingView;
});
