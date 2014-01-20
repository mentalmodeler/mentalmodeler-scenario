/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract'

], function ( $, _, Backbone, AbstractModel ) {
    'use strict';

    var HeaderModel = AbstractModel.extend({
            defaults: {
            },

            initialize: function () {
                HeaderModel.__super__.initialize.apply( this, arguments );
            }
        });

    return HeaderModel;
});