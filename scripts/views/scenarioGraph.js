/*global define*/

define([
    'jquery',
    'underscore',
    'backbone',
    'd3',
    'foundation',
    'views/abstract'
], function ($, _, Backbone, d3, Foundation, AbstractView ) {
    'use strict';

    var ScenarioGraphView = AbstractView.extend({   

        minHeight: 300,
        minWidth: 400,
        doLog: false,
        logPrefix: '--+-- ScenarioGraphView > ',

        initialize: function() {
            ScenarioGraphView.__super__.initialize.apply( this, arguments );
            _.bindAll( this, 'render' );
            this.listenTo( Backbone, 'window:resize', this.render );
        },

        render: function() {
          this.log( 'render' );
          if(this.model) {
            this.$el.find('svg').remove();
          	var data = this.model.getData();
            var height = this.$el.closest('#panel-scenario').height(); // this.$el.parent().height()
            this.$el.height( height );
            d3.select( this.el )
              .datum( data )
                .call( this.renderBarGraph()
                    .width( this.getGraphSize().width )
                    .height( this.getGraphSize().height )
                    .x( function( d, i ) { return d[0]; } )
                    .y( function( d, i ) { return d[1]; } ) );
          }
        },

        setModel: function(newModel) {
          this.model = newModel;
          this.render();
        },

        getGraphSize: function() {
          var scrollsize = 15;
          var useMinWidth = false;
          var useMinHeight = false;
          var w = this.$el.width() - scrollsize;
          var h = this.$el.height() - scrollsize;
          
          if ( w < this.minWidth ) {
            w = this.minWidth;
            useMinWidth = true;
          }

          if ( h < this.minHeight ) {
            h = this.minHeight;
            useMinHeight = true;
          }

          // adjust for scrollbars
          if ( useMinWidth && !useMinHeight) {
            h -= scrollsize;
          }
          else if ( !useMinWidth && useMinHeight ) {
            w -= scrollsize;
          }
          
          this.log('getGraphSize, w:',w,', h:',h,', this.$el.width():',this.$el.width(),', this.$el.height():',this.$el.height() );
          
          return { width:w, height:h };
        },

        renderBarGraph: function() {
          var margin = {top: 30, right: 10, bottom: 30, left: 50},
              width = 420,
              height = 420,
              xRoundBands = 0.2,
              xValue = function(d) { return d[0]; },
              yValue = function(d) { return d[1]; },
              xScale = d3.scale.ordinal(),
              yScale = d3.scale.linear(),
              yAxis = d3.svg.axis().scale(yScale).orient("left"),
              xAxis = d3.svg.axis().scale(xScale),
              dataValues = [],
              conceptNames = [];

          function chart(selection) {
            selection.each(function(data) {
              data = data.map(function(d, i) {
                conceptNames.push(d[0]);
                dataValues.push(d[1]);
                return [xValue.call(data, d, i), yValue.call(data, d, i)];
              });


              var svg = d3.select(this).selectAll("svg").data([data]);
              var gEnter = svg.enter().append("svg").attr("class", "bargraph").append("g");
              var svgEl = svg[0][0];
              var yMin = d3.min(dataValues);
              var yMax = d3.max(dataValues);
              var maxTextSize = d3.max(conceptNames.map(function(conceptName) {
                var textNode = document.createTextNode(conceptName);
                var svgText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                var svgTextSize;
                svgText.appendChild(textNode);
                svgEl.appendChild(svgText);
                svgTextSize = svgText.getComputedTextLength();
                svgEl.removeChild(svgText);
                return svgTextSize;
              }));

              console.log(dataValues);


              if(maxTextSize > 30)
                margin.bottom = maxTextSize + 5;

              if( yMin > 0) 
                yMin = 0;
              if( yMax < 0)
                yMax = 0;              
            
              xScale
                  .domain(data.map(function(d) { return d[0]; }))
                  .rangeRoundBands([0, width - margin.left - margin.right], xRoundBands);

              yScale
                  .domain([yMin, yMax])
                  .range([height - margin.top - margin.bottom, 0])
                  .nice();
                  
              gEnter.append("g").attr("class", "background");
              gEnter.append("g").attr("class", "grid");
              gEnter.append("g").attr("class", "bars");
              gEnter.append("g").attr("class", "barlabels");
              gEnter.append("g").attr("class", "y axis");
              gEnter.append("g").attr("class", "x axis");
              gEnter.append("g").attr("class", "x axis zero");

              svg.attr("width", width)
                  .attr("height", height);

              var g = svg.select("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

              var background = g.select(".background").append("rect");
              background.attr({
                "width": width - margin.left - margin.right,
                "height": height - margin.top - margin.bottom
              });

              var gridLines = g.select(".grid").selectAll('.gridLine').data(data);
              gridLines.enter().append("line");
              gridLines.attr({
                'class' : 'gridLine',
                'x1' : function(d) { return X(d) + xScale.rangeBand() / 2; },
                'x2' : function(d) { return X(d) + xScale.rangeBand() / 2; },
                'y1' : 0,
                'y2' : height - margin.top - margin.bottom
              });

              var bar = svg.select(".bars").selectAll(".bar").data(data);
              bar.enter().append("rect");
              bar.exit().remove();
              bar.attr("class", function(d, i) { return d[1] < 0 ? "bar negative" : "bar positive"; })
                  .attr("x", function(d) { return X(d); })
                  .attr("y", function(d) { return d[1] < 0 ? Y0() : Y(d); })
                  .attr("width", xScale.rangeBand())
                  .attr("height", function(d) { return Math.abs( Y(d) - Y0() ); });

              var barLabel = svg.select(".barlabels").selectAll(".barlabel").data(data);
              barLabel.enter()
                      .append("text")
                      .attr("class", "barlabel")
                      .attr("fill", function(d) { return d[1] < 0 ? "white" : "black"; } )
                      .attr("x", function(d) { return X(d) + xScale.rangeBand() / 2; })
                      .attr("y", function(d) { return d[1] >= 0 ? Y(d) - 3 : Y(d) - 5; })
                      .text(function(d) { return d[1]; });

              //remove bars & labels w/ value of 0
              bar.filter(function(d) { return d[1] == 0; }).remove();
              barLabel.filter(function(d) { return d[1] == 0; }).remove();

              g.select(".x.axis")
                .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
                .call(xAxis.orient("bottom"))
                .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em"
)                    .attr("transform", function(d) {
                        return "rotate(-65)";
                    });
              
              g.select(".x.axis.zero")
                .attr("transform", "translate(0," + Y0() + ")")
                .call(xAxis.tickFormat("").tickSize(0));
              
              g.select(".y.axis")
                .call(yAxis);
                  
            });
          }

          function X(d) {
            return xScale(d[0]);
          }

          function Y0() {
            return yScale(0);
          }

          function Y(d) {
            return yScale(d[1]);
          }

          chart.margin = function(val) {
            margin = val;
            return chart;
          };

          chart.width = function(val) {
            width = val;
            return chart;
          };

          chart.height = function(val) {
            height = val;
            return chart;
          };

          chart.x = function(val) {
            xValue = val;
            return chart;
          };

          chart.y = function(val) {
            yValue = val;
            return chart;
          };

          return chart;          
        }        

    });

    return ScenarioGraphView;
});