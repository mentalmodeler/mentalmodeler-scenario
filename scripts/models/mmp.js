/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract'

], function ( $, _, Backbone, AbstractModel ) {
    'use strict';

    var MmpModel = AbstractModel.extend({
            defaults: {
                xml: null,
                xmlString: '',
                json: null,
                jsonString: '',
                scenarios: '',
                justAdded: false
            },

            initialize: function () {
                MmpModel.__super__.initialize.apply( this, arguments );            
            }
        });

    return MmpModel;
});