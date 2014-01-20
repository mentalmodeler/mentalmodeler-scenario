/*global define*/

define([
    'jquery',
    'backbone',
    'underscore',
    'models/app',
    'views/app'
    
], function ( $, Backbone, _, AppModel, AppView ) {
    'use strict';

    var AppRouter = Backbone.Router.extend({

        appModel: null,
        appView: null,

        routes: {
            '*actions': 'app'
        },

        app: function () {
            this.appModel = new AppModel();
            this.appView = new AppView( {model: this.appModel} );
            this.appView.render();
        }
    });

    return AppRouter;
});
