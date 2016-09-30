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
             w: 600,                //Width of the circle
             h: 600,                //Height of the circle
             margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
             levels: 3,             //How many levels or inner circles should there be drawn
             maxValue: 0,           //What is the value that the biggest circle will represent
             labelFactor: 1.25,     //How much farther than the radius of the outer circle should the labels be placed
             wrapWidth: 60,         //The number of pixels after which a label needs to be given a new line
             opacityArea: 0.35,     //The opacity of the area of the blob
             dotRadius: 4,          //The size of the colored circles of each blog
             opacityCircles: 0.1,   //The opacity of the circles of each blob
             strokeWidth: 2,        //The width of the stroke around each blob
             roundStrokes: false,   //If true the area and stroke will follow a round path (cardinal-closed)
             color: d3.scale.category10(),  //d3.scaleOrdinal(d3.schemeCategory10)  //Color function
             userColor: "FFD70D"
        };
        let dataArray = [];
        _.forOwn(this.props.data, (va, ke)=> {
            let t = [];
            dataArray.push(t);
            _.forOwn(va, (v, k)=>{
                t.push( _.merge(v,{axis: k, company: ke}));
            });
        }); 
        this.normalizedData = dataArray;
        console.log('noralizedData....');
        console.log(this.normalizedData);
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
        let filter = g.append('defs').append('filter').attr('id','glow'),
            feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
            feMerge = filter.append('feMerge'),
            feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
            feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');
        return filter;
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
            .style("stroke", "#CDCDCD")
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
           .style("font-size", "10px")
           .attr("fill", "#737373")
           .text(function(d,i) { return format(maxValue * d/cfg.levels); });
    }

    drawAxes(axGrid, cfg, allAxis, rScale, angleSlice, maxValue, wrapHelper) {
        /////////////////////////////////////////////////////////
        //////////////////// Draw the axes //////////////////////
        /////////////////////////////////////////////////////////
        //console.log('maxValue: '+maxValue);
        //console.log('angleSlice: '+angleSlice);

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
            .style("stroke", "white")
            .style("stroke-width", "2px");

        //Append the labels at each axis
        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "11px")
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
        //console.log('tmp.....');
        //console.log(tmp);
        return [tmp];
    }

    drawUserData(svg, cfg, rScale, angleSlice, g) {

        let userDat = this.normalizeUserData(this.props.userData);
        this.g.select('.userWrapper').remove();
        this.userWrapper = this.g.selectAll(".userWrapper")
            .data(userDat)
            .enter().append("g")
            .attr("class", "userWrapper");
        //console.log('color value');
        //console.log(cfg.color(1));
        this._drawRadarCircles(svg, cfg, rScale, angleSlice, g, userDat, this.userWrapper);
    }

    _drawRadarCircles(svg, cfg, rScale, angleSlice, gElement, radarData, blobWrapper) {
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
        
        //Append the backgrounds    
        blobWrapper
            .append("path")
            .attr("class", "radarArea")
            .attr("d", (d,i) => { return radarLine(d); })
            .style("fill", (d,i) => {return radarData.length > 1 ? cfg.color(i) : cfg.userColor; })
            .style("fill-opacity", cfg.opacityArea)
            .on('mouseover', (d,i) => {
                //Dim all blobs
                console.log('mouseover......');
                d3.selectAll('.radarArea')
                    .transition().duration(200)
                    .style("fill-opacity", 0.1); 
                //Bring back the hovered over blob
                d3.select(this)
                    .transition().duration(200)
                    .style("fill-opacity", 0.7);    
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
            .style("stroke", (d,i) => { return cfg.color(i); })
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
        this._drawRadarCircles(svg, cfg, rScale, angleSlice, gElement, this.normalizedData, this.blobWrapper);
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

        this.filter = this.createGlow(this.g);

        //Wrapper for the grid & axes
        this.axisGrid = this.g.append("g").attr("class", "axisWrapper");
        this.drawBackGroundCircles(this.axisGrid, this.cfg, this.radius);
        this.drawAxisText(this.axisGrid, this.cfg, this.radius, this.maxValue, this.format);
        this.drawAxes(this.axisGrid, this.cfg, this.allAxis, this.rScale, this.angleSlice, this.maxValue, this.wrapHelper);
        //let blobWrapper = this.drawCircleBlobs(this.svg, this.cfg, this.rScale, this.angleSlice, this.g);
        
        //Create a wrapper for the blobs    
        this.g.selectAll(".radarWrapper").remove();

        this.blobWrapper = this.g.selectAll(".radarWrapper")
            .data(this.normalizedData)
            .enter().append("g")
            .attr("class", "radarWrapper");

        this.drawCircleBlobs(this.svg, this.cfg, this.rScale, this.angleSlice, this.g, this.blobwrapper);
        this.drawUserData(this.svg, this.cfg, this.rScale, this.angleSlice);
        this.tooltip = this.g.append("text")
                .attr("class", "tooltip")
                .text('Hello World')
                .style("opacity", 0);

        this.addToolTips(this.rScale, this.angleSlice, this.g, this.format, this.tooltip);
    }

    componentDidMount() {
        const graphContainer = d3.select(this.props.id);
        this.renderGraph();
    }

    componentDidUpdate() {
        // console.log('Update called.......');
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

