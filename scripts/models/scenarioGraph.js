/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract',
    'sylvester' //lib for matrix/vector math
], function ( $, _, Backbone, AbstractModel ) {

    var ScenarioGraphModel = AbstractModel.extend({

            doLog: false,
            logPrefix: '+=+=+ ScenarioGraphModel > ',
            
            initialize: function ( data ) {
                Sylvester.precision = 0.0000000000000001;
                ScenarioGraphModel.__super__.initialize.apply( this, arguments );
                this.data = data;
            },

            getData: function() {
                var concepts = this.data.concepts;
                var influences = this.data.influences;
                var clamps = this.data.clamps;
                var conceptNames = this.getConceptNames( concepts );
                var steadyState = this.converge( influences );
                var scenarioState = this.converge( influences, clamps );
                var relativeDifferences = scenarioState.subtract( steadyState ).elements;

                var filterFunc = function(value, i) { 
                    return clamps[ i ] == 0; //&& concepts[ i ].attributes.selected == 'true'; 
                };

                var filteredDifferences = _.filter( relativeDifferences, filterFunc );
                var filteredConceptNames = _.filter( conceptNames, filterFunc );

                return _.map(filteredDifferences, function(d) {
                    return [ filteredConceptNames.shift(), d ];
                });
            },

            getConceptNames: function( concepts ) {
                var conceptNames = [];
                for(var i = 0; i < concepts.length; i++) {
                    conceptNames.push( concepts[ i ].attributes.name );
                }
                return conceptNames;
            },

            converge: function( data, clamps ) {
                var steps = 0;
                var adjMatrix = Matrix.create( data );
                var prevStateVec = Vector.Zero( data.length );
                var curStateVec = Vector.Zero( data.length ).map( function( x ) { return x + 1; } );

                while( !curStateVec.eql( prevStateVec ) ) {
                    steps++;
                    prevStateVec = curStateVec;
                    curStateVec = adjMatrix.multiply( curStateVec );
                    curStateVec.each(function( x, i ) {
                        if( clamps && clamps[ i - 1 ] != 0 ) {
                            curStateVec.elements[ i - 1 ] = clamps[ i - 1 ];
                        }
                        else {
                            curStateVec.elements[ i - 1 ] = Math.pow( Math.E, x ) / ( Math.pow( Math.E, x ) + 1 );
                        }
                    });
                }

                return curStateVec;          
            }

        });

    return ScenarioGraphModel;
});