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
        doLog: true,
        
        events: {
            'change #authorText' : 'onAuthorChange',
            'input #nameText' : 'onNameChange',
            'change #descriptionText' : 'onDescrChange',
        },
        
        initialize: function() {
            InfoView.__super__.initialize.apply( this, arguments );
            this.listenTo( Backbone, 'selection:change', this.onSelectionChange );
        },


        render: function() {            
            var info = { name:'', author:'', description: '' };
            if ( window.mentalmodeler.appModel.curModel !== null) {
                info = window.mentalmodeler.appModel.curModel.getInfo()
            }
            this.$el.html( this.template( info ) );
            return this;
        },

        onAuthorChange: function( e ) {
            //var val = this.$el.find('')
            this.saveInfo( 'author', $(e.target).val() );
        },

        onNameChange: function( e ) {
            this.saveInfo( 'name', $(e.target).val() );
        },

        onDescrChange: function( e ) {
            this.saveInfo( 'description', $(e.target).val() );
        },

        onSelectionChange: function( model, target, section ) {
            this.render();
        },

        saveInfo: function( type, value) {
            var curModel = window.mentalmodeler.appModel.curModel;
            if ( curModel ) {
                console.log('value:',value)
                curModel.infoModel.set( type, value );
                Backbone.trigger( 'info:change' );
            }
        }

    });

    return InfoView;
});