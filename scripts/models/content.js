/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract'

], function ( $, _, Backbone, AbstractModel ) {
    'use strict';

    var ContentModel = AbstractModel.extend({
            defaults: {
            },

            initialize: function () {
                ContentModel.__super__.initialize.apply( this, arguments );
            }
        });

    return ContentModel;
});