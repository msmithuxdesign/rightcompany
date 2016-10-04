import * as d3 from "d3";
import React from 'react';
import ReactDOM from 'react-dom';
import * as _ from 'lodash';
import classnames from 'classnames';

// Thanks to http://bl.ocks.org/nbremer/21746a9668ffdf6d8242
// for the original implementation

export default class RadarChart extends React.Component {

    constructor(props)  {
        super(props);
        this.radarChart = null;

        this.cfg = {
             w: 500,                //Width of the circle
             h: 500,                //Height of the circle
             margin: {top: 70, right: 90, bottom: 70, left: 90}, //The margins of the SVG
             levels: 3,             //How many levels or inner circles should there be drawn
             maxValue: 0,           //What is the value that the biggest circle will represent
             labelFactor: 1.25,     //How much farther than the radius of the outer circle should the labels be placed
             wrapWidth: 60,         //The number of pixels after which a label needs to be given a new line
             opacityArea: 0.15,     //The opacity of the area of the blob
             dotRadius: 4,          //The size of the colored circles of each blog
             opacityCircles: 0.1,   //The opacity of the circles of each blob
             strokeWidth: 2,        //The width of the stroke around each blob
             roundStrokes: true,   //If true the area and stroke will follow a round path (cardinal-closed)
             color: d3.scale.category10(),  //d3.scaleOrdinal(d3.schemeCategory10)  //Color function
             userColor: "FFD70D"
        };
        let dataArray = [];
        _.forOwn(this.props.data, (va, ke)=> {
            if(ke !== '[object Object]') {
                let t = [];
                dataArray.push(t);
                _.forOwn(va, (v, k)=>{
                    t.push( _.merge(v,{axis: k, company: ke}));
                }); 
            }
            
        }); 
        this.normalizedData = dataArray;
    }

    _createCircleId(data) {
        console.log('_createCircleId...');
        console.log(data);
        //console.log(data);
        let radarId = '';
        if(typeof data.company ==='undefined')
            radarId = 'userDataBlob';
        else{
            radarId = data.company.replace(new RegExp(' ', 'g'), '_');    
        }
        console.log(radarId);
        return radarId;
    }

    
    /////////////////////////////////////////////////////////
    /////////////////// Helper Function /////////////////////
    /////////////////////////////////////////////////////////

    //Taken from http://bl.ocks.org/mbostock/7555321
    //Wraps SVG text    
    wrapHelper(text, width) {
      text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.4, // ems
            y = text.attr("y"),
            x = text.attr("x"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
            
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
          }
        }
      });
    }//wrap 

    createAxis() {
        return (this.props.categories);      //Names of each axis                           
    }

    createGlow(g) {
        let filter = 
            g.append('defs').append('filter').attr('id','glow'),
                feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
                feMerge = filter.append('feMerge'),
                //feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur');
                feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');
    }
    
    drawBackGroundCircles(axGrid, cfg, radius, ) {
        //Draw the background circles
        axGrid.selectAll(".levels")
           .data(d3.range(1,(cfg.levels+1)).reverse())
           .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", function(d, i){return radius/cfg.levels*d;})
            .style("fill", "#CDCDCD")
            .style("stroke", "#645F5F")
            .style("fill-opacity", cfg.opacityCircles)
            .style("filter" , "url(#glow)");

    }

    drawAxisText(axGrid, cfg, radius, maxValue, format)  {
        //Text indicating at what % each level is
        axGrid.selectAll(".axisLabel")
           .data(d3.range(1,(cfg.levels+1)).reverse())
           .enter().append("text")
           .attr("class", "axisLabel")
           .attr("x", 4)
           .attr("y", function(d){return -d*radius/cfg.levels;})
           .attr("dy", "0.4em")
           .attr("fill", "#000000")
           .text(function(d,i) { return format(maxValue * d/cfg.levels); });
    }

    drawAxes(axGrid, cfg, allAxis, rScale, angleSlice, maxValue, wrapHelper) {
        /////////////////////////////////////////////////////////
        //////////////////// Draw the axes //////////////////////
        /////////////////////////////////////////////////////////

        //Create the straight lines radiating outward from the center
        const axis = axGrid.selectAll(".axis")
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis");
        //Append the lines
        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", function(d, i){ 
                const val = rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); 
                return isNaN(val) ? 0 : val;
            })
            .attr("y2", function(d, i){ 
                const val = rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2);
                return isNaN(val) ? 0 : val; })
            .attr("class", "line")
            .style("stroke", "darkred")
            .style("opacity", "0.35")
            .style("stroke-width", "2px");

        //Append the labels at each axis
        axis.append("text")
            .attr("class", "legend")
            //.style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", function(d, i){ 
                const val = rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2);
                return isNaN(val) ? 0 : val; })
            .attr("y", function(d, i){ 
                const val = rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2);
                return isNaN(val) ? 0 : val; })
            .text(function(d){return d})
            .call(wrapHelper, cfg.wrapWidth);
    }

    normalizeUserData(userData) {
        let tmp = [];
        _.forOwn(userData, (val, key) => {
            tmp.push({axis: key, value: val});
        });
        return [tmp];
    }

    drawUserData(svg, cfg, rScale, angleSlice, g) {

        let userDat = this.normalizeUserData(this.props.userData);
        this.g.select('.userWrapper').remove();
        this.userWrapper = this.g.selectAll(".userWrapper")
            .data(userDat)
            .enter().append("g")
            .attr("class", "userWrapper");
        this._drawRadarCircles(svg, cfg, rScale, angleSlice, g, userDat, this.userWrapper, this._createCircleId, 'userDataBlob');

        d3.select("#userDataBlob")
            .style("fill-opacity", (cfg.opacityArea * 4))
            .transition().duration(800) 
            .style("fill-opacity", cfg.opacityArea);  
    }

   

    _drawRadarCircles(svg, cfg, rScale, angleSlice, gElement, radarData, blobWrapper, createCircleId, id='') {
        /////////////////////////////////////////////////////////
        ///////////// Draw the radar chart blobs ////////////////
        /////////////////////////////////////////////////////////
        let radarLine = d3.svg.line.radial()
            .interpolate("linear-closed")
            .radius(function(d) { return isNaN(d.value) ? 0 : rScale(d.value); })
            .angle(function(d,i) {  return i*angleSlice; });
        
        if(cfg.roundStrokes) {
            radarLine.interpolate("cardinal-closed");
        }

        if(id === '') {
            blobWrapper
                .append("path")
                .attr("class", "radarArea")
                .attr('id', (d, i)=> { return createCircleId(d[0]);})
                .attr("d", (d,i) => { return radarLine(d); })
                .style("fill", (d,i) => {return radarData.length > 1 ? cfg.color(i) : cfg.userColor; })
                .style("fill-opacity", cfg.opacityArea);
        }else {
            blobWrapper
                .append("path")
                .attr("class", "radarArea")
                .attr("id", id)
                .attr("d", (d,i) => { return radarLine(d); })
                .style("fill", (d,i) => {return radarData.length > 1 ? cfg.color(i) : cfg.userColor; })
                .style("fill-opacity", cfg.opacityArea);
        }
        
        //Append the backgrounds    
        blobWrapper
            .on('mouseover', function(d,i) {
                //console.log(d);
                let id = '#' + createCircleId(d[0]);
                d3.select(id)
                    .transition().duration(200)
                    .style("fill-opacity", 0.05); 
                d3.select(id)
                    .transition().duration(200)
                    .style("fill-opacity", (cfg.opacityArea * 3));    
            })
            .on('mouseout', () => {
                //Bring back all blobs
                d3.selectAll(".radarArea")
                    .transition().duration(200)
                    .style("fill-opacity", cfg.opacityArea);
            });
        
        //Create the outlines   
        blobWrapper.append("path")
            .attr("class", "radarStroke")
            .attr("d", (d,i) => { return radarLine(d); })
            .style("stroke-width", this.cfg.strokeWidth + "px")
            .style("stroke", (d,i) => {return radarData.length > 1 ? cfg.color(i) : cfg.userColor; })
            .style("fill", "none")
            .style("filter" , "url(#glow)");        
    
        //Append the circles
        blobWrapper.selectAll(".radarCircle")
            .data( (d,i) => { return radarLine(d) })
            .enter().append("circle")
            .attr("class", "radarCircle")
            .attr("r", cfg.dotRadius)
            .attr("cx", (d,i) => { 
                const val = rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2);
                return isNaN(val) ? 0 : val; })
            .attr("cy", (d,i) => { 
                const val = rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2);
                return isNaN(val) ? 0 : val; })
            .style("fill", (d,i,j) => { return cfg.color(j); })
            .style("fill-opacity", 0.8); 
    }

    drawCircleBlobs(svg, cfg, rScale, angleSlice, gElement) {
        this._drawRadarCircles(svg, cfg, rScale, angleSlice, gElement, this.normalizedData, this.blobWrapper, this._createCircleId);
    }

    addToolTips(rScale, angleSlice, gElement, format, tooltip) {
        /////////////////////////////////////////////////////////
        //////// Append invisible circles for tooltip ///////////
        /////////////////////////////////////////////////////////
        
        //Wrapper for the invisible circles on top
        let blobCircleWrapper = gElement.selectAll(".radarCircleWrapper")
            .data(this.normalizedData)
            .enter().append("g")
            .attr("class", "radarCircleWrapper");
        
        //Append a set of invisible circles on top for the mouseover pop-up
        blobCircleWrapper.selectAll(".radarInvisibleCircle")
            .data( (d,i) => { return d; })
            .enter().append("circle")
            .attr("class", "radarInvisibleCircle")
            .attr("r", this.cfg.dotRadius*1.5)
            .attr("cx", (d,i) => { 
                const val = rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2);
                return isNaN(val) ? 0 : val; })
            .attr("cy", (d,i) => { 
                const val = rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2);
                return isNaN(val) ? 0 : val; })
            .style("fill", "none")
            .style("pointer-events", "all")
                .on("mouseover", (d,i) => {
                if(d === 'null' && typeof d === 'undefined') {
                    return;
                }
                console.log('this.....');
                console.log(this);
             
                tooltip
                    .attr('x', d3.mouse(this)[0])
                    .attr('y', d3.mouse(this)[1])
                    .text(format(d.value))
                    .transition().duration(200)
                    .style('opacity', 1);
            })
            .on("mouseout",() => {
                tooltip.transition().duration(200)
                    .style("opacity", 0);
            });
    }

    _drawLegendItems(legendSvg, legendKeys, colorFunc, idFunc) {
        legendSvg.selectAll('circle-legend')
            .data(legendKeys)
            .enter()
            .append('circle')
            .attr('class', 'circle-legend')
            .attr('id', function(d,i){return idFunc(d)+'Key';})
            .attr('cx', 25)
            .attr('cy', function(d, i){return i * 35 + 30;})
            .attr('r', 15)
            .on('mouseover', function(d, i){
                //console.log(idFunc(d)+'Key');
                d3.selectAll('.circle-legend')
                    .style('fill-opacity', 0.05) 
                    .style('stroke-opacity', 0.45);

                d3.select(this)
                    .style('fill-opacity', 0.3) 
                    .style('stroke-opacity', 1);

                d3.select('#'+idFunc(d))
                    .transition().duration(200)
                    .style("fill-opacity", (0.15 * 3));   

            })
            .on('mouseout', function(d, i){
                d3.selectAll('.circle-legend')
                    .style('fill-opacity', 0.3) 
                    .style('stroke-opacity', 1);

                d3.select('#'+idFunc(d))
                    .style("fill-opacity", 0.15);   
            })
            .style('stroke', function(d,i){return colorFunc(i);})
            .style('stroke-width', 3)
            .style('fill', function(d,i){return colorFunc(i);})
            .style('fill-opacity', .3);

        legendSvg.selectAll('text')
            .data(legendKeys)
            .enter()
            .append('text')
            .attr('x', 52)
            .attr('y', function(d, i){ return i * 35 + 35;})
            .text(function(d, i){return legendKeys[i]; });
    }

    _drawLegend(legendId, cfg) {
        const legendContainer = d3.select('.chart-key').append('svg')
            .attr('width', 200)
            .attr('height', 240);
        let legendKeys = [];
        this.normalizedData.forEach((a) => {
            if(a[0].company && typeof a[0].company === 'string')
                legendKeys.push( a[0].company );
        });

        this._drawLegendItems(legendContainer, legendKeys, cfg.color, (d)=>{ return d.replace(new RegExp(' ', 'g'), '_');});
        legendContainer.selectAll('user-circle')
            .data(['Your Profile'])
            .enter()
            .append('circle')
            .attr('id', 'userDataBlobKey')
            .attr('cx', 25)
            .attr('cy', (d, i) => {return (this.normalizedData.length + 1) * 35 - 3;})
            .attr('r', 15)
            .style('stroke', function(d,i){return cfg.userColor;})
            .style('stroke-width', 3)
            .style('fill', function(d,i){return cfg.userColor;})
            .style('fill-opacity', .3)
            .on('mouseover', function(d,i){
                d3.selectAll('.circle-legend')
                    .style('fill-opacity', 0.05) 
                    .style('stroke-opacity', 0.45);

                d3.select('#userDataBlob')
                    .transition().duration(200)
                    .style("fill-opacity", (0.15 * 3));    
            })
            .on('mouseout', function(d,i) {
                d3.selectAll('.circle-legend')
                    .style('fill-opacity', 0.3) 
                    .style('stroke-opacity', 1);

                d3.select('#userDataBlob')
                    .transition().duration(200)
                    .style("fill-opacity", 0.15);    

            });

        legendContainer.selectAll('user-text')
            .data(['Your Profile'])
            .enter()
            .append('text')
            .attr('x', 52)
            .attr('y', (d, i) => { return (this.normalizedData.length + 1)* 35;})
            .text(function(d, i){return 'Your Profile'; });
        
    }

    renderGraph() {
        //Put all of the options into a variable called this.cfg
        if(this.props != null && 'undefined' !== typeof this.props.options){
          for(var i in this.options){
            if('undefined' !== typeof options[i]){ this.cfg[i] = options[i]; }
          }
        }

        let values =[];
        _.forIn(this.props.data, function(value, key){
            _.forIn(value, function(v, k){
                values.push(v.value);
            });
        });
        values = _.compact(values);

        this.maxValue = d3.max(values);
        this.allAxis = this.createAxis();
        this.total = this.allAxis.length;
        this.radius = Math.min(this.cfg.w/2, this.cfg.h/2);
        this.format = d3.format('.2f');
        this.angleSlice = Math.PI * 2 / this.total;

        //Scale for the radius
        this.rScale = d3.scale.linear()
            .range([0, this.radius])
            .domain([0, this.maxValue]);

        //Remove whatever chart with the same id/class was present before
        d3.select(this.props.id).select("svg").remove();

        //Initiate the radar chart SVG
        this.svg = d3.select(this.props.id).append("svg")
                .attr("width",  this.cfg.w + this.cfg.margin.left + this.cfg.margin.right)
                .attr("height", this.cfg.h + this.cfg.margin.top + this.cfg.margin.bottom)
                .attr("class", "radar"+this.props.id);
        //Append a g element        
        this.g = this.svg.append("g")
                .attr("transform", "translate(" + (this.cfg.w/2 + this.cfg.margin.left) + "," + (this.cfg.h/2 + this.cfg.margin.top) + ")");

        this.createGlow(this.g);

        //Wrapper for the grid & axes
        this.axisGrid = this.g.append("g").attr("class", "axisWrapper");
        this.drawBackGroundCircles(this.axisGrid, this.cfg, this.radius);
        this.drawAxes(this.axisGrid, this.cfg, this.allAxis, this.rScale, this.angleSlice, this.maxValue, this.wrapHelper);
        
        //Create a wrapper for the blobs    
        this.g.selectAll(".radarWrapper").remove();

        this.blobWrapper = this.g.selectAll(".radarWrapper")
            .data(this.normalizedData)
            .enter().append("g")
            .attr("class", "radarWrapper");

        this.drawCircleBlobs(this.svg, this.cfg, this.rScale, this.angleSlice, this.g, this.blobwrapper);
        this.drawUserData(this.svg, this.cfg, this.rScale, this.angleSlice);
        this.drawBackGroundCircles(this.axisGrid, this.cfg, this.radius);
        this.drawAxisText(this.axisGrid, this.cfg, this.radius, this.maxValue, this.format);
        this.tooltip = this.g.append("text")
                .attr("class", "tooltip")
                .text('Hello World')
                .style("opacity", 0);
        this._drawLegend(this.cfg.legendId, this.cfg);
        this.addToolTips(this.rScale, this.angleSlice, this.g, this.format, this.tooltip);
    }

    componentDidMount() {
        const graphContainer = d3.select(this.props.id);
        this.renderGraph();
    }

    componentDidUpdate() {
        this.drawUserData(this.svg, this.cfg, this.rScale, this.angleSlice);
    }

    componentWillUnmount() {
        d3.select(id).select("svg").remove();
    }

    render() {
        return (
          <div id="radarchart-container"></div>
        );
  }
}

React.PropTypes.RadarChart = {
    data: React.PropTypes.object.isRequired,
    userData: React.PropTypes.object.isRequired,
    id: React.PropTypes.string.isRequired,
    options: React.PropTypes.object.isRequired,
    categories: React.PropTypes.array.isRequired
};

