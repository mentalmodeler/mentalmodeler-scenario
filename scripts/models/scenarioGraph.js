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
            
            initialize: function ( data, squashFunc ) {
                ScenarioGraphModel.__super__.initialize.apply( this, arguments );
                this.data = data;
                this.squashFunc = this.pickSquashFunc( squashFunc );
            },

            getData: function() {
                var concepts = this.data.concepts;
                var influences = this.data.influences;
                var clamps = this.data.clamps;
                var conceptNames = this.getConceptNames( concepts );
                var steadyState = this.converge( math.ones( influences.length ), influences );
                var scenarioState = this.converge( steadyState, influences, clamps );
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
                for( var i = 0; i < concepts.length; i++ ) {
                    conceptNames.push( concepts[ i ].get( 'name' ) );
                }
                return conceptNames;
            },

            bivalent: function( x ) { 
                if( x <= 0 ) {
                    return 0;
                }
                else {
                    return 1;
                }
            },

            trivalent: function( x ) {
                if( x < 0 ) {
                    return -1;
                } 
                else if( x > 0 ) {
                    return 1;
                }
                else {
                    return 0;
                }
            },

            sigmoid: function( x ) {
                return 1 / ( 1 + Math.exp( -x ) );
            },
            
            pickSquashFunc( funcName ) {
                switch( funcName ) {
                    case "trivalent":
                        return this.trivalent;
                    break;
                    case "sigmoid":
                        return this.sigmoid;
                    break;
                    case "hyperbolic tangent":
                        return math.tanh;
                    break;
                    case "bivalent":
                    default:
                        return this.bivalent;
                    break;
                }
            },

            converge: function( initialVector, weights, clamps ) {
                var squashingFunction = this.squashFunc;
                var iterations = 0;
                var weightMatrix = math.matrix( weights );
                var curStateVec = initialVector;
                var prevStateVec;

                while( !this.equalVectors( prevStateVec, curStateVec ) && iterations < 100 ) {
                    prevStateVec = curStateVec;
                    curStateVec = math.multiply( curStateVec, weightMatrix );
                    curStateVec.forEach(function( x, i, vec ) {
                        if( clamps && clamps[ i[0] ] !== 0 ) {
                            curStateVec.subset( math.index( i ), clamps[ i[0] ] );
                        }
                        else {
                            curStateVec.subset( math.index( i ), squashingFunction( x ) );
                        }
                    });

                    iterations++;
                }

                return curStateVec;          
            },

            equalVectors: function( vecA, vecB ) {
                if( !vecA || !vecB || vecA.size()[1] !== vecB.size()[1] ) {
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
