/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract'

], function ( $, _, Backbone, AbstractModel ) {
    'use strict';

    var ListModel = AbstractModel.extend({
            defaults: {
            },
            
            initialize: function () {
                ListModel.__super__.initialize.apply( this, arguments );
            },

            render: function() {

            }
        });

    return ListModel;
});