// Generated by CoffeeScript 1.7.1
var activeButton, activeCounty, activeData, activeDimension, addCommas, allCountyData, allCountyTimeSlices, axisk, backgroundCounties, bb, blockContextMenu, canvasHeight, canvasWidth, color, colorDomains, compressData, compressedData, constant, counties, countyAdded, countyLine, countyPoints, countyTitle, defaultPath, dimension, dimensions, drawPC, drawVisualization, expandExtent, firstTime, formatk, formats, generateLabels, getColorDomain, graphContainer, graphFrame, graphLine, graphMask, graphXAxis, graphXScale, graphYAxis, graphYScale, hasDataAllDimensions, i, indicator, keyFrame, keyLabels, labels, line, loadingContainer, mapContainer, mapFrame, mapMask, mapX, mapY, modifyGraph, nationalData, nationalLine, nationalPoints, nationalTitle, numBuckets, parseDate, path, pcAxis, pcBackground, pcBrush, pcFocus, pcForeground, pcFrame, pcNational, pcPath, pcScales, pcx, pcy, projection, resetChoropleth, scaleY, setPcScales, standardMargin, svg, timeSlice, units, usGeo, vsText, windowHeight, windowWidth, x, yAxis, yLabel, zeroes, zoomChoropleth, zoomedCounty, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;

windowWidth = 0.95 * window.innerWidth;

windowHeight = 0.8 * window.innerHeight;

standardMargin = windowHeight * (20 / 800);

canvasWidth = windowWidth - 2 * standardMargin;

canvasHeight = canvasWidth * 0.45;

d3.select("body").style("font-size", "" + ((canvasWidth / 1558.68) * 16) + "px");

svg = d3.select("#visualization").append("svg").attr("width", canvasWidth + 2 * standardMargin).attr("height", canvasHeight + 3 * standardMargin).append("g").attr("transform", "translate(" + standardMargin + ", " + standardMargin + ")");

constant = {
  rightMargin: canvasWidth * (500 / 1600),
  leftMargin: canvasWidth * (80 / 1600),
  verticalSeparator: canvasHeight * (20 / 800),
  horizontalSeparator: canvasWidth * (30 / 1600),
  graphClipHorizontalOffset: canvasWidth * (9 / 1600),
  graphClipVerticalOffset: canvasHeight * (50 / 800),
  zoomBox: standardMargin * 2,
  stateBorderWidth: 1,
  recolorDuration: 1000,
  choroplethDuration: 750,
  graphDuration: 500,
  graphLineDuration: 500 * .9,
  graphDurationDimSwitch: 1000,
  snapbackDuration: 500,
  nationalTitleOffset: -(canvasWidth / 20.7824),
  vsOffset: -(canvasWidth / 194.835),
  countyTitleOffset: canvasWidth / 311.736,
  labelY: canvasHeight * (7 / 800),
  tooltipOffset: canvasWidth * (5 / 1600),
  pcOffset: 0.2,
  handleRadius: canvasWidth * 0.0047,
  dataUnavailableColor: "#d9d9d9",
  dataNotSelectedColor: "#898989"
};

dimensions = ['MedianListPrice', 'MedianListPricePerSqft', 'PctOfListingsWithPriceReductions', 'MedianPctOfPriceReduction'];

labels = {
  'MedianListPrice': "Median list price ($)",
  'MedianListPricePerSqft': "Median list price / ft² ($)",
  'PctOfListingsWithPriceReductions': "Listings with price cut (%)",
  'MedianPctOfPriceReduction': "Median price reduction (%)",
  'ZriPerSqft': "Median rent price / ft² ($)"
};

units = {
  'MedianListPrice': '$',
  'MedianListPricePerSqft': '$',
  'PctOfListingsWithPriceReductions': '%',
  'MedianPctOfPriceReduction': '%',
  'ZriPerSqft': '$'
};

numBuckets = 9;

getColorDomain = function(data) {
  var dataPerBucket, n;
  n = data.length;
  return dataPerBucket = Math.round(n / numBuckets);
};

x = [];

_ref = d3.range(1000);
for (_i = 0, _len = _ref.length; _i < _len; _i++) {
  i = _ref[_i];
  x.push(Math.random() * 100);
}

getColorDomain(x);

colorDomains = {
  'MedianListPrice': [0, 70000, 90000, 100000, 150000, 200000, 250000, 500000, 2000000],
  'MedianListPricePerSqft': [0, 20, 40, 60, 100, 200, 300, 500, 1500],
  'PctOfListingsWithPriceReductions': [0, 5, 10, 20, 25, 30, 35, 40, 100],
  'MedianPctOfPriceReduction': [0, 2, 4, 6, 8, 10, 15, 20, 100],
  'ZriPerSqft': [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 5]
};

formats = {
  'MedianListPrice': d3.format("$,g"),
  'MedianListPricePerSqft': function(d) {
    return "" + (d3.format("$,.2f")(d));
  },
  'PctOfListingsWithPriceReductions': function(d) {
    return "" + (d3.format(".1f")(d)) + "%";
  },
  'MedianPctOfPriceReduction': function(d) {
    return "" + (d3.format(".1f")(d)) + "%";
  },
  'ZriPerSqft': function(d) {
    return "" + (d3.format("$,.2f")(d));
  }
};

formatk = d3.format(".2s");

addCommas = function(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

generateLabels = function() {
  var dimension, keyLabels, _j, _k, _l, _len1, _len2, _len3, _len4, _m, _ref1, _ref2, _ref3;
  keyLabels = {};
  for (_j = 0, _len1 = dimensions.length; _j < _len1; _j++) {
    dimension = dimensions[_j];
    keyLabels[dimension] = [];
    if (units[dimension] === '$') {
      if (dimension === 'MedianListPrice') {
        _ref1 = d3.range(colorDomains[dimension].length - 1);
        for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
          i = _ref1[_k];
          keyLabels[dimension].push("$" + (formatk(colorDomains[dimension][i])) + " - $" + (formatk(colorDomains[dimension][i + 1])));
        }
      } else {
        _ref2 = d3.range(colorDomains[dimension].length - 1);
        for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
          i = _ref2[_l];
          keyLabels[dimension].push("$" + (addCommas(colorDomains[dimension][i])) + " - $" + (addCommas(colorDomains[dimension][i + 1])));
        }
      }
    } else {
      _ref3 = d3.range(colorDomains[dimension].length - 1);
      for (_m = 0, _len4 = _ref3.length; _m < _len4; _m++) {
        i = _ref3[_m];
        keyLabels[dimension].push("" + (addCommas(colorDomains[dimension][i])) + "% - " + (addCommas(colorDomains[dimension][i + 1])) + "%");
      }
    }
  }
  return keyLabels;
};

keyLabels = generateLabels();

pcScales = {
  'MedianListPrice': [colorDomains['MedianListPrice'][8], colorDomains['MedianListPrice'][0]],
  'MedianListPricePerSqft': [colorDomains['MedianListPricePerSqft'][8], colorDomains['MedianListPricePerSqft'][0]],
  'PctOfListingsWithPriceReductions': [colorDomains['PctOfListingsWithPriceReductions'][8], colorDomains['PctOfListingsWithPriceReductions'][0]],
  'MedianPctOfPriceReduction': [colorDomains['MedianPctOfPriceReduction'][8], colorDomains['MedianPctOfPriceReduction'][0]],
  'ZriPerSqft': [colorDomains['ZriPerSqft'][8], colorDomains['ZriPerSqft'][0]]
};

activeDimension = dimensions[0];

activeButton = d3.select(".btn").style("color", "#000").style("background-color", "#fff");

_ref1 = [{}, null, null, null], nationalData = _ref1[0], allCountyData = _ref1[1], usGeo = _ref1[2], timeSlice = _ref1[3];

_ref2 = [null, null, null, null, null, null, null, null, null, null], backgroundCounties = _ref2[0], counties = _ref2[1], yAxis = _ref2[2], nationalTitle = _ref2[3], vsText = _ref2[4], countyTitle = _ref2[5], yLabel = _ref2[6], nationalLine = _ref2[7], nationalPoints = _ref2[8], countyLine = _ref2[9], countyPoints = _ref2[10];

bb = {
  map: {
    x: 0,
    y: 0,
    width: canvasWidth - constant.rightMargin - constant.rightMargin * 1 / 2,
    height: canvasHeight * (3 / 4)
  },
  graph: {
    x: constant.leftMargin,
    y: canvasHeight * (3 / 4) + constant.verticalSeparator,
    width: canvasWidth - constant.rightMargin - constant.leftMargin,
    height: canvasHeight * (1 / 4) - constant.verticalSeparator
  },
  pc: {
    x: canvasWidth - constant.rightMargin + constant.horizontalSeparator,
    y: 0,
    width: constant.rightMargin - constant.horizontalSeparator,
    height: canvasHeight + constant.verticalSeparator * 1.28
  }
};

mapContainer = svg.append("g").attr("transform", "translate(" + bb.map.x + ", " + bb.map.y + ")");

keyFrame = svg.append("g").attr("id", "keyFrame").attr("transform", "translate(" + (bb.map.width + constant.horizontalSeparator / 2) + ", " + bb.map.y + ")");

mapContainer.append("clipPath").attr("id", "mapClip").append("rect").attr("width", bb.map.width).attr("height", bb.map.height);

mapMask = mapContainer.append("g").attr("clip-path", "url(#mapClip)");

mapFrame = mapMask.append("g").attr("id", "mapFrame").attr("width", bb.map.width).attr("height", bb.map.height).style("stroke-width", "" + constant.stateBorderWidth + "px");

blockContextMenu = function(event) {
  return event.preventDefault();
};

document.querySelector('#mapFrame').addEventListener('contextmenu', blockContextMenu);

zoomedCounty = d3.select(null);

zoomChoropleth = function(d) {
  var bounds, dx, dy, scale, translate, y;
  if (zoomedCounty.node() === this) {
    return resetChoropleth();
  }
  zoomedCounty.classed("zoomed", false).style("stroke", "none");
  zoomedCounty = d3.select(this).classed("zoomed", true).style("stroke", "#fd8d3c");
  bounds = path.bounds(d);
  dx = bounds[1][0] - bounds[0][0] + constant.zoomBox;
  dy = bounds[1][1] - bounds[0][1] + constant.zoomBox;
  x = (bounds[0][0] + bounds[1][0]) / 2;
  y = (bounds[0][1] + bounds[1][1]) / 2;
  scale = 0.9 / Math.max(dx / bb.map.width, dy / bb.map.height);
  translate = [bb.map.width / 2 - scale * x, bb.map.height / 2 - scale * y];
  return mapFrame.transition().duration(constant.choroplethDuration).style("stroke-width", "" + (constant.stateBorderWidth / scale) + "px").attr("transform", "translate(" + translate + ")scale(" + scale + ")");
};

resetChoropleth = function() {
  zoomedCounty.classed("zoomed", false).style("stroke", "none");
  zoomedCounty = d3.select(null);
  return mapFrame.transition().duration(constant.choroplethDuration).style("stroke-width", "" + constant.stateBorderWidth + "px").attr("transform", "");
};

graphContainer = svg.append("g").attr("transform", "translate(" + (bb.graph.x - constant.leftMargin) + ", " + (bb.graph.y - constant.verticalSeparator) + ")");

graphContainer.append("clipPath").attr("id", "graphClip").append("rect").attr("width", bb.graph.width + constant.leftMargin + constant.graphClipHorizontalOffset).attr("height", bb.graph.height + constant.verticalSeparator + constant.graphClipVerticalOffset);

graphMask = graphContainer.append("g").attr("clip-path", "url(#graphClip)");

graphFrame = graphMask.append("g").attr("transform", "translate(" + constant.leftMargin + ", " + constant.verticalSeparator + ")").attr("id", "graphFrame").attr("width", bb.map.width).attr("height", bb.map.height);

parseDate = d3.time.format("%Y-%m").parse;

graphXScale = d3.time.scale().range([0, bb.graph.width]).clamp(true);

graphYScale = d3.scale.linear().range([bb.graph.height, constant.verticalSeparator / 2]);

graphXAxis = d3.svg.axis().scale(graphXScale).orient("bottom");

graphYAxis = d3.svg.axis().scale(graphYScale).ticks([5]).orient("left");

graphLine = d3.svg.line().interpolate("linear").defined(function(d) {
  return d !== "";
}).x(function(d, i) {
  return graphXScale(nationalData.dates[i]);
}).y(function(d) {
  return graphYScale(+d);
});

expandExtent = function(extent) {
  return [0.98 * extent[0], 1.02 * extent[1]];
};

scaleY = function(countyArray, nationalValues) {
  var allValues, point, _j, _len1;
  allValues = [].concat(nationalValues.map(function(n) {
    return +n;
  }));
  for (_j = 0, _len1 = countyArray.length; _j < _len1; _j++) {
    point = countyArray[_j];
    allValues.push(+point);
  }
  graphYScale.domain(expandExtent(d3.extent(allValues)));
  return yAxis.transition().duration(constant.graphDuration).call(graphYAxis);
};

activeCounty = d3.select(null);

countyAdded = false;

zeroes = [];

activeData = null;

modifyGraph = function(d, nationalValues, t) {
  var countyArray;
  if (activeCounty.node() === t) {
    activeCounty.style("fill", function(d) {
      return color(d.properties[activeDimension][timeSlice]);
    });
    activeCounty = d3.select(null);
    countyAdded = false;
    activeData = null;
    countyLine.remove();
    countyPoints.remove();
    pcFocus.classed("hidden", true);
    scaleY([], nationalValues);
    vsText.transition().duration(constant.graphDuration).attr("transform", "translate(" + (bb.graph.width / 2 + constant.vsOffset) + ", " + constant.verticalSeparator + ")").style("opacity", 0).remove();
    countyTitle.transition().duration(constant.graphDuration).attr("transform", "translate(" + (bb.graph.width / 2 + constant.countyTitleOffset) + ", " + constant.verticalSeparator + ")").style("opacity", 0).remove();
    nationalTitle.transition().duration(constant.graphDuration).attr("transform", "translate(" + (bb.graph.width / 2) + ", 0)");
    nationalLine.datum(nationalValues).transition().duration(constant.graphDuration).attr("d", graphLine);
    nationalPoints.data(nationalValues).transition().duration(constant.graphDuration).attr("transform", function(d, i) {
      return "translate(" + (graphXScale(nationalData.dates[i])) + ", " + (graphYScale(d)) + ")";
    });
    return;
  }
  pcFocus.classed("hidden", function(e) {
    if (+e.id === +d.id) {
      return false;
    }
    return true;
  });
  activeCounty.style("fill", function(d) {
    return color(d.properties[activeDimension][timeSlice]);
  });
  activeCounty = d3.select(t).style("fill", "#fd8d3c");
  activeData = d;
  countyArray = d.properties[activeDimension];
  if (!countyAdded) {
    countyAdded = true;
    nationalTitle.transition().duration(constant.graphDuration).attr("transform", function(d) {
      return "translate(" + (bb.graph.width / 2 + constant.nationalTitleOffset) + ", 0)";
    });
    vsText = graphFrame.append("text").attr("class", "title vs").attr("text-anchor", "middle").attr("transform", "translate(" + (bb.graph.width * 1.5) + ", 0)").style("opacity", 0).text("vs.");
    vsText.transition().duration(constant.graphDuration).style("opacity", 1).attr("transform", "translate(" + (bb.graph.width / 2 + constant.vsOffset) + ", 0)");
    countyTitle = graphFrame.append("text").attr("class", "title county").attr("text-anchor", "start").attr("transform", "translate(" + (bb.graph.width * 1.5) + ", 0)").style("opacity", 0).text("" + d.properties.name);
    countyTitle.transition().duration(constant.graphDuration).style("opacity", 1).attr("transform", "translate(" + (bb.graph.width / 2 + constant.countyTitleOffset) + ", 0)");
    scaleY(countyArray, nationalValues);
    nationalLine.transition().duration(constant.graphDuration).attr("d", graphLine);
    nationalPoints.transition().duration(constant.graphDuration).attr("transform", function(d, i) {
      return "translate(" + (graphXScale(nationalData.dates[i])) + ", " + (graphYScale(d)) + ")";
    });
    zeroes = [];
    countyArray.forEach(function() {
      return zeroes.push(0);
    });
    countyLine = graphFrame.append("path").datum(zeroes).attr("class", "line county invisible").attr("d", graphLine);
    countyPoints = graphFrame.selectAll(".point.county.invisible").data(zeroes).enter().append("circle").attr("class", "point county invisible").attr("transform", function(d, i) {
      return "translate(" + (graphXScale(nationalData.dates[i])) + ", " + (graphYScale(d)) + ")";
    }).attr("r", 3);
    countyPoints.on("mouseover", function(d) {
      d3.select("#tooltip").classed("hidden", false).style("left", "" + (d3.event.pageX + constant.tooltipOffset) + "px").style("top", "" + (d3.event.pageY + constant.tooltipOffset) + "px");
      return d3.select("#county").html(function() {
        return "" + (formats[activeDimension](d));
      });
    });
    countyPoints.on("mouseout", function(d) {
      return d3.select("#tooltip").classed("hidden", true);
    });
    countyLine.datum(countyArray).attr("class", "line county").transition().duration(constant.graphDuration).attr("d", graphLine);
    return countyPoints.data(countyArray).attr("class", "point county").classed("hidden", function(d) {
      if (d === "") {
        return true;
      }
      return false;
    }).transition().duration(constant.graphDuration).attr("transform", function(d, i) {
      return "translate(" + (graphXScale(nationalData.dates[i])) + ", " + (graphYScale(d)) + ")";
    });
  } else {
    countyTitle.transition().duration(constant.graphDuration / 2).attr("transform", "translate(" + (bb.graph.width / 2 + constant.countyTitleOffset) + ", " + constant.verticalSeparator + ")").style("opacity", 0).remove();
    countyTitle = graphFrame.append("text").attr("class", "title county").attr("text-anchor", "start").attr("transform", "translate(" + (bb.graph.width / 2 + constant.countyTitleOffset) + ", " + (-constant.verticalSeparator) + ")").style("opacity", 0).text("" + d.properties.name);
    countyTitle.transition().delay(constant.graphDuration / 2).duration(constant.graphDuration / 2).attr("transform", "translate(" + (bb.graph.width / 2 + constant.countyTitleOffset) + ", 0)").style("opacity", 1);
    scaleY(countyArray, nationalValues);
    nationalLine.transition().duration(constant.graphDuration).attr("d", graphLine);
    nationalPoints.transition().duration(constant.graphDuration).attr("transform", function(d, i) {
      return "translate(" + (graphXScale(nationalData.dates[i])) + ", " + (graphYScale(d)) + ")";
    });
    countyLine.datum(countyArray).classed("hidden", true).transition().delay(constant.graphLineDuration).duration(0).attr("d", graphLine).attr("class", "line county");
    return countyPoints.data(countyArray).classed("hidden", function(d) {
      if (d === "") {
        return true;
      }
      return false;
    }).transition().duration(constant.graphDuration).attr("transform", function(d, i) {
      return "translate(" + (graphXScale(nationalData.dates[i])) + ", " + (graphYScale(d)) + ")";
    });
  }
};

pcFrame = svg.append("g").attr("id", "pcFrame").attr("transform", "translate(" + bb.pc.x + ", " + bb.pc.y + ")");

compressedData = [];

_ref3 = [null, null, null, null], pcForeground = _ref3[0], pcBackground = _ref3[1], pcFocus = _ref3[2], pcNational = _ref3[3];

pcy = d3.scale.ordinal().rangePoints([0, bb.pc.height], constant.pcOffset);

pcx = {};

for (_j = 0, _len1 = dimensions.length; _j < _len1; _j++) {
  dimension = dimensions[_j];
  pcx[dimension] = d3.scale.linear().range([0, bb.pc.width]);
}

line = d3.svg.line();

pcAxis = {};

for (_k = 0, _len2 = dimensions.length; _k < _len2; _k++) {
  dimension = dimensions[_k];
  if (dimension === 'MedianListPrice') {
    axisk = d3.svg.axis().orient("bottom").tickFormat(function(d) {
      return formatk(d);
    });
    axisk.ticks(4);
    pcAxis[dimension] = axisk;
  } else {
    pcAxis[dimension] = d3.svg.axis().orient("bottom").ticks(4);
  }
}

axisk.ticks(4);

pcy.domain(dimensions);

compressData = function(data) {
  var add, countyData, dataPoint, properties, _l, _len3, _len4, _m;
  compressedData = [];
  for (_l = 0, _len3 = data.length; _l < _len3; _l++) {
    countyData = data[_l];
    properties = countyData.properties;
    dataPoint = {
      "id": +countyData.id
    };
    add = true;
    for (_m = 0, _len4 = dimensions.length; _m < _len4; _m++) {
      dimension = dimensions[_m];
      if (properties[dimension].length === 0) {
        add = false;
        continue;
      }
      dataPoint[dimension] = properties[dimension];
    }
    if (add) {
      compressedData.push(dataPoint);
    }
  }
  return compressedData;
};

pcPath = function(d) {
  return line(dimensions.map(function(dimension) {
    if (d[dimension][timeSlice] === "") {
      return [bb.pc.width / 2, pcy(dimension)];
    }
    return [pcx[dimension](+d[dimension][timeSlice]), pcy(dimension)];
  }));
};

defaultPath = " M 10 25";

pcBrush = function() {
  var activeCounties, actives, extents, graphactiveCounties, graphactives, graphextents, _l, _len3;
  activeCounties = {};
  graphactiveCounties = {};
  actives = [];
  extents = [];
  for (_l = 0, _len3 = dimensions.length; _l < _len3; _l++) {
    dimension = dimensions[_l];
    actives.push(dimension);
    if (pcx[dimension].brush.empty()) {
      extents.push(pcScales[dimension]);
    } else {
      extents.push(pcx[dimension].brush.extent());
    }
  }
  graphactives = dimensions.filter(function(p) {
    return !pcx[p].brush.empty();
  });
  graphextents = actives.map(function(p) {
    return pcx[p].brush.extent();
  });
  pcForeground.classed("hidden", function(d) {
    var allmet;
    allmet = actives.every(function(p, i) {
      var value;
      value = d[p][timeSlice];
      return ((extents[i][0] <= value) && (value <= extents[i][1])) && (value !== "");
    });
    if (allmet === true) {
      activeCounties[+d.id] = true;
      return false;
    } else {
      activeCounties[+d.id] = false;
      return true;
    }
  });
  return counties.classed("hidden", function(e) {
    var countyID;
    countyID = +e.id;
    if ((countyID in activeCounties) === false) {
      if (graphextents.length > 0) {
        return true;
      }
      return false;
    } else if (activeCounties[countyID]) {
      return false;
    }
    return true;
  });
};

setPcScales = function() {
  var county, dimensionExtent, properties, thisTimeSliceData, _l, _len3, _len4, _len5, _len6, _m, _n, _o, _results;
  thisTimeSliceData = {};
  for (_l = 0, _len3 = dimensions.length; _l < _len3; _l++) {
    dimension = dimensions[_l];
    thisTimeSliceData[dimension] = [];
  }
  for (_m = 0, _len4 = allCountyData.length; _m < _len4; _m++) {
    county = allCountyData[_m];
    properties = county.properties;
    if (hasDataAllDimensions(properties, timeSlice)) {
      for (_n = 0, _len5 = dimensions.length; _n < _len5; _n++) {
        dimension = dimensions[_n];
        thisTimeSliceData[dimension].push(+properties[dimension][timeSlice]);
      }
    }
  }
  _results = [];
  for (_o = 0, _len6 = dimensions.length; _o < _len6; _o++) {
    dimension = dimensions[_o];
    dimensionExtent = d3.extent(thisTimeSliceData[dimension]);
    _results.push(pcScales[dimension] = [dimensionExtent[0] * 0.9, dimensionExtent[1] * 1.05]);
  }
  return _results;
};

drawPC = function() {
  pcBackground.attr("class", function(d) {
    if (allCountyTimeSlices[+d.id][timeSlice] === false) {
      return "hidden";
    }
  }).attr("d", function(d) {
    if (allCountyTimeSlices[+d.id][timeSlice]) {
      return pcPath(d);
    }
    return defaultPath;
  });
  pcForeground.classed("hidden", function(d) {
    if (allCountyTimeSlices[+d.id][timeSlice] === false) {
      return true;
    }
    return false;
  }).attr("d", function(d) {
    if (allCountyTimeSlices[+d.id][timeSlice]) {
      return pcPath(d);
    }
    return defaultPath;
  });
  pcFocus.attr("d", function(d) {
    if (allCountyTimeSlices[+d.id][timeSlice]) {
      return pcPath(d);
    }
    return defaultPath;
  });
  pcNational.attr("d", pcPath);
  return pcBrush();
};

mapX = bb.map.width / 2 + constant.horizontalSeparator;

mapY = bb.map.height / 2;

projection = d3.geo.albersUsa().scale(1.25 * bb.map.width).translate([mapX, mapY]);

path = d3.geo.path().projection(projection);

color = d3.scale.threshold().range(colorbrewer.YlGn[9]);

hasDataAllDimensions = function(d, timeSlice) {
  var hasAll, _l, _len3;
  hasAll = true;
  for (_l = 0, _len3 = dimensions.length; _l < _len3; _l++) {
    dimension = dimensions[_l];
    if ((d[dimension].length === 0) || (d[dimension][timeSlice] === "")) {
      hasAll = false;
    }
  }
  return hasAll;
};

allCountyTimeSlices = {};

drawVisualization = function(firstTime) {
  var allValues, brush, brushed, count, county, dataRange, g, handle, ix, keyBoxPadding, keyBoxRatio, keyBoxSize, moveBrush, nationalValues, pcAxes, point, properties, roundedPosition, slider, sliderScale, swatch, update, _l, _len3, _len4, _len5, _len6, _len7, _m, _n, _o, _p, _ref4, _ref5;
  nationalValues = nationalData[activeDimension];
  color.domain(colorDomains[activeDimension]);
  if (firstTime) {
    allCountyData = topojson.feature(usGeo, usGeo.objects.counties).features;
    dataRange = d3.range(allCountyData[0].properties[activeDimension].length);
    for (_l = 0, _len3 = allCountyData.length; _l < _len3; _l++) {
      county = allCountyData[_l];
      properties = county.properties;
      allCountyTimeSlices[+county.id] = [];
      for (_m = 0, _len4 = dataRange.length; _m < _len4; _m++) {
        ix = dataRange[_m];
        allCountyTimeSlices[+county.id].push(hasDataAllDimensions(properties, ix));
      }
    }
    backgroundCounties = mapFrame.append("g").selectAll(".backgroundCounty").data(allCountyData).enter().append("path").attr("d", path).style("fill", function(d) {
      if (hasDataAllDimensions(d.properties, timeSlice) === false) {
        return constant.dataUnavailableColor;
      }
      return constant.dataNotSelectedColor;
    }).style("opacity", 1.0).on("click", zoomChoropleth);
    counties = mapFrame.append("g").attr("id", "counties").selectAll(".county").data(allCountyData).enter().append("path").attr("class", function(d) {
      return "county c" + (+d.id);
    }).attr("d", path).style("fill", function(d) {
      var countyData;
      countyData = d.properties[activeDimension];
      if (countyData.length === 0) {
        return constant.dataUnavailableColor;
      } else {
        if (countyData[timeSlice] === "") {
          return constant.dataUnavailableColor;
        } else {
          return color(countyData[timeSlice]);
        }
      }
    }).style("opacity", 1.0).on("click", zoomChoropleth);
    mapFrame.append("path").attr("id", "state-borders").datum(topojson.mesh(usGeo, usGeo.objects.states, function(a, b) {
      return a !== b;
    })).attr("d", path);
    counties.on("contextmenu", function(d) {
      if (d.properties[activeDimension].length === 0) {

      } else if (d.properties[activeDimension][timeSlice] === "") {

      } else {
        nationalValues = nationalData[activeDimension];
        return modifyGraph(d, nationalValues, this);
      }
    });
    counties.on("mouseover", function(d) {
      if (d.properties[activeDimension].length === 0) {

      } else if (d.properties[activeDimension][timeSlice] === "") {

      } else {
        d3.select(this).style("opacity", 0.8);
      }
      d3.select("#tooltip").style("left", "" + (d3.event.pageX + constant.tooltipOffset) + "px").style("top", "" + (d3.event.pageY + constant.tooltipOffset) + "px").classed("hidden", false);
      return d3.select("#county").html(function() {
        if (d.properties[activeDimension].length === 0 || d.properties[activeDimension][timeSlice] === "") {
          return "" + d.properties.name;
        }
        return "" + d.properties.name + "<br><br>" + (formats[activeDimension](d.properties[activeDimension][timeSlice]));
      });
    });
    backgroundCounties.on("mouseover", function(d) {
      d3.select("#tooltip").style("left", "" + (d3.event.pageX + constant.tooltipOffset) + "px").style("top", "" + (d3.event.pageY + constant.tooltipOffset) + "px").classed("hidden", false);
      return d3.select("#county").html(function() {
        return "" + d.properties.name;
      });
    });
    counties.on("mouseout", function(d) {
      d3.select("#tooltip").classed("hidden", true);
      return d3.select(this).transition().duration(250).style("opacity", 1.0);
    });
    backgroundCounties.on("mouseout", function(d) {
      return d3.select("#tooltip").classed("hidden", true);
    });
    count = 0;
    keyBoxSize = bb.map.height / ((keyLabels[activeDimension].length + 2) * 2.4);
    keyBoxRatio = 1 / 3;
    keyBoxPadding = keyBoxSize * 0.2;
    _ref4 = colorbrewer.YlGn[9];
    for (_n = 0, _len5 = _ref4.length; _n < _len5; _n++) {
      swatch = _ref4[_n];
      if (swatch === "#ffffe5") {
        continue;
      }
      keyFrame.append("rect").attr("width", keyBoxSize).attr("height", keyBoxSize).attr("transform", "translate(" + (constant.horizontalSeparator / 2) + ", " + (bb.map.height * keyBoxRatio + count * (keyBoxSize + keyBoxPadding)) + ")").style("fill", swatch).style("stroke", "gray").style("stroke-opacity", 0.1);
      keyFrame.append("text").attr("class", "keyLabel").attr("transform", "translate(" + (constant.horizontalSeparator * 1.8) + ", " + (bb.map.height * keyBoxRatio + (count + 0.6) * (keyBoxSize + keyBoxPadding)) + ")").text(keyLabels[activeDimension][count]);
      count += 1;
    }
    keyFrame.append("rect").attr("width", keyBoxSize).attr("height", keyBoxSize).attr("transform", "translate(" + (constant.horizontalSeparator / 2) + ", " + (bb.map.height * keyBoxRatio + (count + 1) * (keyBoxSize + keyBoxPadding)) + ")").style("fill", constant.dataUnavailableColor).style("stroke-opacity", 0.2);
    keyFrame.append("text").attr("transform", "translate(" + (constant.horizontalSeparator * 1.8) + ", " + (bb.map.height * keyBoxRatio + (count + 1.6) * (keyBoxSize + keyBoxPadding)) + ")").text("Data unavailable");
    count += 1;
    keyFrame.append("rect").attr("width", keyBoxSize).attr("height", keyBoxSize).attr("transform", "translate(" + (constant.horizontalSeparator / 2) + ", " + (bb.map.height * keyBoxRatio + (count + 1) * (keyBoxSize + keyBoxPadding)) + ")").style("fill", constant.dataNotSelectedColor).style("stroke-opacity", 0.2);
    keyFrame.append("text").attr("transform", "translate(" + (constant.horizontalSeparator * 1.8) + ", " + (bb.map.height * keyBoxRatio + (count + 1.6) * (keyBoxSize + keyBoxPadding)) + ")").text("Not selected");
  } else {
    counties.transition().duration(constant.recolorDuration).ease("linear").style("fill", function(d) {
      var countyData;
      if (allCountyTimeSlices[+d.id][timeSlice]) {
        countyData = d.properties[activeDimension];
        if (activeData !== null && (countyData === activeData.properties[activeDimension])) {
          return "#fd8d3c";
        } else {
          return color(countyData[timeSlice]);
        }
      }
    });
    d3.selectAll(".keyLabel").text(function(d, i) {
      return keyLabels[activeDimension][i];
    });
  }
  if (firstTime) {
    compressedData = compressData(allCountyData);
    setPcScales();
    for (_o = 0, _len6 = dimensions.length; _o < _len6; _o++) {
      dimension = dimensions[_o];
      pcx[dimension].domain(pcScales[dimension]);
    }
    pcBackground = pcFrame.append("g").attr("class", "pcBackground").selectAll("path").data(compressedData).enter().append("path");
    pcForeground = pcFrame.append("g").attr("class", "pcForeground").selectAll("path").data(compressedData).enter().append("path");
    pcFocus = pcFrame.append("g").attr("class", "pcFocus").selectAll("path").data(compressedData).enter().append("path").attr("class", "hidden");
    pcNational = pcFrame.append("g").datum(nationalData).attr("class", "pcNational").append("path");
    g = pcFrame.selectAll(".dimension").data(dimensions).enter().append("g").attr("class", "dimension").attr("transform", function(d) {
      return "translate(0, " + (pcy(d)) + ")";
    });
    pcAxes = g.append("g").attr("class", "pcAxis").each(function(d) {
      return d3.select(this).call(pcAxis[d].scale(pcx[d]));
    });
    pcAxes.append("text").attr("text-anchor", "end").attr("x", bb.pc.width).attr("y", -9).text(function(d) {
      return labels[d];
    });
    g.append("g").attr("class", "pcBrush").each(function(d) {
      return d3.select(this).call(pcx[d].brush = d3.svg.brush().x(pcx[d]).on("brush", pcBrush));
    }).selectAll("rect").attr("y", -8).attr("height", 16);
    drawPC();
  }
  allValues = [].concat(nationalValues.map(function(n) {
    return +n;
  }));
  if (activeData !== null) {
    _ref5 = activeData.properties[activeDimension];
    for (_p = 0, _len7 = _ref5.length; _p < _len7; _p++) {
      point = _ref5[_p];
      allValues.push(+point);
    }
  }
  graphYScale.domain(expandExtent(d3.extent(allValues)));
  if (firstTime) {
    graphXScale.domain([nationalData.dates[0], nationalData.dates[nationalData.dates.length - 1]]);
    graphFrame.append("g").attr("class", "x axis").attr("transform", "translate(0, " + bb.graph.height + ")").call(graphXAxis);
    yAxis = graphFrame.append("g").attr("class", "y axis").call(graphYAxis);
    nationalTitle = graphFrame.append("text").attr("class", "title national").attr("text-anchor", "middle").attr("transform", "translate(" + (bb.graph.width / 2) + ", 0)").text("National Trend");
    yLabel = graphFrame.append("text").attr("class", "y label").attr("text-anchor", "end").attr("y", constant.labelY).attr("dy", ".75em").attr("transform", "rotate(-90)").text(labels[activeDimension]);
    nationalLine = graphFrame.append("path").datum(nationalData[activeDimension]).attr("class", "line national").attr("d", graphLine);
    nationalPoints = graphFrame.selectAll(".point.national").data(nationalData[activeDimension]).enter().append("circle").attr("class", "point national").attr("transform", function(d, i) {
      return "translate(" + (graphXScale(nationalData.dates[i])) + ", " + (graphYScale(+d)) + ")";
    }).attr("r", 3);
    nationalPoints.on("mouseover", function(d) {
      d3.select("#tooltip").classed("hidden", false).style("left", "" + (d3.event.pageX + constant.tooltipOffset) + "px").style("top", "" + (d3.event.pageY + constant.tooltipOffset) + "px");
      return d3.select("#county").html(function() {
        return "" + (formats[activeDimension](d));
      });
    });
    nationalPoints.on("mouseout", function(d) {
      return d3.select("#tooltip").classed("hidden", true);
    });
    sliderScale = d3.scale.linear().domain([0, nationalValues.length - 1]).range([0, bb.graph.width]).clamp(true);
    roundedPosition = null;
    update = function() {
      backgroundCounties.style("fill", function(d) {
        if (allCountyTimeSlices[+d.id][timeSlice]) {
          return constant.dataNotSelectedColor;
        }
        return constant.dataUnavailableColor;
      });
      return counties.style("fill", function(d) {
        var countyData;
        if (allCountyTimeSlices[+d.id][timeSlice]) {
          countyData = d.properties[activeDimension];
          if (activeData !== null && (countyData === activeData.properties[activeDimension])) {
            return "#fd8d3c";
          } else {
            return color(countyData[timeSlice]);
          }
        }
      }).classed("hidden", function(d) {
        if (allCountyTimeSlices[+d.id][timeSlice]) {
          return false;
        } else {
          return true;
        }
      });
    };
    brushed = function() {
      var rawPosition;
      rawPosition = brush.extent()[0];
      roundedPosition = Math.round(rawPosition);
      if (d3.event.sourceEvent) {
        rawPosition = sliderScale.invert(d3.mouse(this)[0]);
        roundedPosition = Math.round(rawPosition);
        brush.extent([rawPosition, rawPosition]);
      }
      handle.attr("cx", sliderScale(rawPosition));
      if (timeSlice !== roundedPosition) {
        timeSlice = roundedPosition;
        return update();
      }
    };
    brush = d3.svg.brush().x(sliderScale).extent([0, 0]).on("brushstart", function() {
      return handle.transition().duration(constant.snapbackDuration).attr("r", constant.handleRadius * 1.2).style("fill", "white");
    }).on("brush", brushed).on("brushend", function() {
      var updatePC;
      updatePC = function() {
        var _len8, _q;
        setPcScales();
        for (_q = 0, _len8 = dimensions.length; _q < _len8; _q++) {
          dimension = dimensions[_q];
          pcx[dimension].domain(pcScales[dimension]);
        }
        pcAxes.each(function(d) {
          return d3.select(this).call(pcAxis[d].scale(pcx[d]));
        });
        return drawPC();
      };
      handle.transition().duration(constant.snapbackDuration).attr("cx", sliderScale(roundedPosition)).attr("r", constant.handleRadius).style("fill", "black");
      return window.setTimeout(updatePC, constant.snapbackDuration);
    });
    slider = graphFrame.append("g").attr("class", "slider").attr("transform", "translate(0, " + bb.graph.height + ")").call(brush);
    slider.selectAll(".extent,.resize").remove();
    handle = slider.append("circle").attr("class", "handle").attr("r", constant.handleRadius).style("stroke", "black").style("fill", "black");
    moveBrush = function(delay, duration, value) {
      return slider.transition().delay(delay).duration(duration).call(brush.event).call(brush.extent([value, value])).call(brush.event);
    };
    window.focus();
    return d3.select(window).on("keydown", function() {
      var keyPressed;
      keyPressed = d3.event.keyCode;
      if (keyPressed === 39) {
        if (timeSlice < 40) {
          timeSlice = timeSlice + 1;
          moveBrush(0, 250, timeSlice);
        }
      }
      if (keyPressed === 37) {
        if (timeSlice > 0) {
          timeSlice = timeSlice - 1;
          return moveBrush(0, 250, timeSlice);
        }
      }
    });
  } else {
    yAxis.transition().duration(constant.graphDurationDimSwitch).call(graphYAxis);
    yLabel.transition().duration(constant.graphDurationDimSwitch / 2).style("opacity", 0);
    yLabel.transition().delay(constant.graphDurationDimSwitch / 2).duration(constant.graphDurationDimSwitch / 2).text(labels[activeDimension]).style("opacity", 1);
    nationalLine.datum(nationalValues).transition().duration(constant.graphDurationDimSwitch).attr("d", graphLine);
    nationalPoints.data(nationalValues).transition().duration(constant.graphDurationDimSwitch).attr("transform", function(d, i) {
      return "translate(" + (graphXScale(nationalData.dates[i])) + ", " + (graphYScale(d)) + ")";
    });
    if (activeData !== null) {
      countyLine.datum(activeData.properties[activeDimension]).classed("hidden", true).transition().delay(constant.graphLineDuration).duration(0).attr("d", graphLine).attr("class", "line county");
      if (activeData.properties[activeDimension].length === 0) {
        return countyPoints.classed("hidden", true);
      } else {
        return countyPoints.data(activeData.properties[activeDimension]).classed("hidden", function(d) {
          if (d === "") {
            return true;
          }
          return false;
        }).transition().duration(constant.graphDurationDimSwitch).attr("transform", function(d, i) {
          return "translate(" + (graphXScale(nationalData.dates[i])) + ", " + (graphYScale(d)) + ")";
        });
      }
    }
  }
};

firstTime = true;

d3.selectAll(".btn").on("mouseover", function() {
  if (activeButton.node() === this) {
    return;
  }
  return d3.select(this).style("color", "#000").style("background-color", "#fff");
}).on("mouseout", function() {
  if (activeButton.node() === this) {
    return;
  }
  return d3.select(this).transition().duration(250).style("color", "#fff").style("background-color", "#000");
}).on("click", function() {
  if (+this.value === dimensions.indexOf(activeDimension)) {

  } else {
    activeButton.style("color", "#fff").style("background-color", "#000");
    activeButton = d3.select(this).style("color", "#000").style("background-color", "#fff");
    activeDimension = dimensions[this.value];
    return drawVisualization(firstTime);
  }
});

loadingContainer = svg.append("g").attr("transform", "translate(" + (canvasWidth / 2) + ", " + (canvasHeight / 2) + ")");

indicator = loadingContainer.append("g").attr("class", "progress-meter");

indicator.append("text").attr("text-anchor", "middle").attr("dy", ".35em").text("Loading...");

d3.json("../data/compressed-nationwide-data.json", function(nationwide) {
  return d3.json("../data/compressed-augmented-us-states-and-counties.json").get(function(error, us) {
    var _ref4;
    indicator.transition().delay(250).attr("transform", "scale(0)");
    _ref4 = [nationwide, us], nationalData = _ref4[0], usGeo = _ref4[1];
    nationalData.dates = nationalData.dates.map(function(dateString) {
      return parseDate(dateString);
    });
    timeSlice = 0;
    drawVisualization(firstTime);
    return firstTime = !firstTime;
  });
});
