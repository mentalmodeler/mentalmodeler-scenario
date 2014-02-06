/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'models/abstract',
    'sylvester' //lib for matrix/vector math
], function ( $, _, Backbone, AbstractModel ) {

    var ScenarioGraphModel = AbstractModel.extend({

            initialize: function ( data ) {
                Sylvester.precision = 0.0000000000000001;
                ScenarioGraphModel.__super__.initialize.apply( this, arguments );
                this.data = data;
            },

            getData: function() {
                var steadyState = this.converge( this.data.influences );
                var scenarioState = this.converge( this.data.influences, this.data.clamps );
                return scenarioState.subtract( steadyState );
            },

            getConcepts: function() {
                var conceptModels = this.data.concepts;
                var concepts = [];
                for(var i = 0; i < conceptModels.length; i++) {
                    concepts.push( conceptModels[ i ].attributes.name );
                }
                return concepts;
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