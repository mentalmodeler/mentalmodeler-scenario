/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'd3',
    'models/abstract',
    'math' //lib for matrix/vector math
], function ( $, _, Backbone, d3, AbstractModel, math ) {

    var ScenarioGraphModel = AbstractModel.extend({

            doLog: false,
            logPrefix: '+=+=+ ScenarioGraphModel > ',
            
            initialize: function ( data ) {
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
                var relativeDifferences = math.subtract( scenarioState, steadyState );

                var filterFunc = function(value, i) { 
                    return clamps[ i ] == 0 && concepts[ i ].get( 'selected' ); 
                };

                var filteredDifferences = _.filter( relativeDifferences._data, filterFunc );
                var filteredConceptNames = _.filter( conceptNames, filterFunc );

                return _.map(filteredDifferences, function(d) {
                    return [ filteredConceptNames.shift(), d3.round(d, 2) ];
                });
            },

            getConceptNames: function( concepts ) {
                var conceptNames = [];
                for(var i = 0; i < concepts.length; i++) {
                    conceptNames.push( concepts[ i ].get( 'name' ) );
                }
                return conceptNames;
            },

            converge: function( data, clamps ) {
                var steps = 0;
                var adjMatrix = math.matrix( data );
                var prevStateVec = math.zeros( data.length );
                var curStateVec = math.ones( data.length );

                while( !this.equalVectors( prevStateVec, curStateVec ) ) {
                    steps++;
                    prevStateVec = curStateVec;
                    curStateVec = math.multiply( curStateVec, adjMatrix );
                    curStateVec.forEach(function( x, i, vec ) {
                        if( clamps && clamps[ i[0] ] !== 0 ) {
                            curStateVec.subset( math.index( i ), clamps[ i[0] ] );
                        }
                        else {
                            curStateVec.subset( math.index( i ), 1 / ( 1 + Math.pow( Math.E, -x ) ) );
                        }
                    });
                }
                return curStateVec;          
            },

            equalVectors: function( vecA, vecB ) {
                if( vecA.size()[1] !== vecB.size()[1] ) {
                    return false;
                }

                var result = true;
                vecA.forEach(function(val, ind, vec) {
                    var valA = math.round( val, 5 );
                    var valB = math.round( vecB.subset( math.index( ind ) ), 5 );
                    result = result && ( valA === valB );
                });

                return result;
            }
        });

    return ScenarioGraphModel;
});