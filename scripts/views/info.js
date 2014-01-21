/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'foundation',
    'views/abstract',
    'text!templates/info.html'
], function ($, _, Backbone, Foundation, AbstractView, Template) {
    'use strict';

    var InfoView = AbstractView.extend({
        
        tagName: 'div',
        className: 'info',
        template: _.template( $(Template).html() ),
        
        events: {
        },
        
        initialize: function() {
            InfoView.__super__.initialize.apply( this, arguments );
            this.listenTo( Backbone, 'selection:change', this.onSelectionChange );
            //this.listenTo( Backbone, 'mmp:xmlStringChange', this.onSelectionChange );
        },


        render: function() {            
            var info = { name:'', author:'', description: '' };
            if ( window.mentalmodeler.appModel.curModel !== null) {
                info = window.mentalmodeler.appModel.curModel.getInfo()
            }
            this.$el.html( this.template( info ) );
            return this;
        },

        onSelectionChange: function( model, target, section ) {
            this.render();
        }
    });

    return InfoView;
});