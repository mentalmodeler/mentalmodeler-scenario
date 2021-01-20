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
                var conceptIds = this.getConceptData( concepts, 'id' );
                var conceptNames = this.getConceptData( concepts, 'name' );
                var steadyState = this.converge( math.ones( influences.length ), influences.length, influences );
                var scenarioState = this.converge( math.ones( influences.length ), influences.length, influences, clamps );
                var relativeDifferences = math.subtract( scenarioState, steadyState );

                var filterFunc = function(value, i) { 
                    return clamps[ i ] == 0 && concepts[ i ].get( 'selected' ); 
                };

                var filteredDifferences = _.filter( relativeDifferences._data, filterFunc );
                var filteredConceptNames = _.filter( conceptNames, filterFunc );
                var filteredConceptIds = _.filter( conceptIds, filterFunc );

                return _.map(filteredDifferences, function(d) {
                    return [ filteredConceptNames.shift(), d3.round(d, 2), filteredConceptIds.shift() ];
                });
            },

            getConceptData: function( concepts, attr ) {
                var conceptData = [];
                for( var i = 0; i < concepts.length; i++ ) {
                    conceptData.push( concepts[ i ].get( attr ) );
                }
                return conceptData;
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
            
            pickSquashFunc: function( funcName ) {
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

            converge: function( initialVector, vecSize, weights, clamps ) {
                let squashingFunction = this.squashFunc;
                let weightMatrix = math.matrix( weights );
                let prevStateVec = initialVector;
                let currStateVec;
                let diff = 1;

                while( diff > 0.00001 ) {
                    let intermediateVec = math.zeros( vecSize );
                    currStateVec = math.zeros( vecSize );
                    intermediateVec = math.multiply( weightMatrix, prevStateVec );

                    currStateVec.forEach(function( x, i, vec ) {
                        if( clamps && clamps[ i[0] ] !== 0 ) {
                            currStateVec.subset( math.index( i ), clamps[ i[ 0 ] ] );
                        }
                        else {
                            currStateVec.subset( math.index( i ), squashingFunction( intermediateVec.subset(math.index( i ) ) ) );
                        }
                    });

                    diff = math.max( math.abs( math.subtract( currStateVec, prevStateVec ) ) );
                    prevStateVec = currStateVec;
                }

                return currStateVec;          
            }
        });

    return ScenarioGraphModel;
});
