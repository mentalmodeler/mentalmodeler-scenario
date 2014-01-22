/* global define, $, console */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract',
    'models/concept'

], function ( $, _, Backbone, AbstractModel, ConceptModel ) {
    'use strict';

    var ScenarioModel = AbstractModel.extend({
            defaults: {
                xml: ''
            },

            conceptCollection: new Backbone.Collection( [], {model: ConceptModel} ),
            
            initialize: function () {
                ScenarioModel.__super__.initialize.apply( this, arguments );
            }
        });

    return ScenarioModel;
});