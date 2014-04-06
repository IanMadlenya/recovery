# Allows us to size layout to current viewport, achieving pseudo-responsiveness
windowWidth = 0.95*window.innerWidth
windowHeight = 0.8*window.innerHeight

# Mike Bostock's margin convention
standardMargin = windowHeight*(20/800)
canvasWidth = windowWidth - 2*standardMargin
canvasHeight = windowHeight - 2*standardMargin

svg = d3.select("#visualization").append("svg")
    .attr("width", canvasWidth + 2*standardMargin)
    .attr("height", canvasHeight + 3*standardMargin)
    .append("g")
    .attr("transform", "translate(#{standardMargin}, #{standardMargin})")

constant = 
    rightMargin: canvasWidth*(500/1600)
    leftMargin: canvasWidth*(100/1600),
    verticalSeparator: canvasHeight*(20/800),
    horizontalSeparator: canvasWidth*(30/1600),
    graphClipHorizontalOffset: canvasWidth*(9/1600),
    graphClipVerticalOffset: canvasHeight*(50/800),
    zoomBox: standardMargin*2,
    stateBorderWidth: 1,
    recolorDuration: 2500,
    choroplethDuration: 750,
    graphDuration: 500,
    graphDurationDimSwitch: 2500,
    # Viewport width is constant enough that we can set these as absolute values
    nationalTitleOffset: -75,
    vsOffset: -8,
    countyTitleOffset: 5,
    labelY: canvasHeight*(7/800),
    tooltipOffset: canvasWidth*(5/1600),
    pcOffset: 0.2

# Zillow data dimensions in use
dimensions = [
    'MedianListPrice',
    'MedianListPricePerSqft',
    'PctOfListingsWithPriceReductions',
    'MedianPctOfPriceReduction', 
    'ZriPerSqft'
]

# Nicely formatted labels used for y-axis labelling
labels =
    'MedianListPrice': "Median list price ($)",
    'MedianListPricePerSqft': "Median list price / ft² ($)",
    'PctOfListingsWithPriceReductions': "Listings with price cut (%)",
    'MedianPctOfPriceReduction': "Median price reduction (%)", 
    'ZriPerSqft': "Median rent price / ft² ($)" 

# 9-value domains, one for each dimension, used for choropleth map coloring
colorDomains =
    'MedianListPrice': [0, 70000, 90000, 100000, 150000, 200000, 250000, 500000, 5000000],
    'MedianListPricePerSqft': [0, 20, 40, 60, 100, 200, 300, 500, 1300],
    'PctOfListingsWithPriceReductions': [0, 5, 10, 20, 25, 30, 35, 40, 100],
    'MedianPctOfPriceReduction': [0, 2, 4, 6, 8, 10, 15, 20, 100], 
    'ZriPerSqft': [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 5] 

# Scales for the parallel coordinate graph axes
pcScales = 
    'MedianListPrice': [colorDomains['MedianListPrice'][8], colorDomains['MedianListPrice'][0]],
    'MedianListPricePerSqft': [colorDomains['MedianListPricePerSqft'][8], colorDomains['MedianListPricePerSqft'][0]],
    'PctOfListingsWithPriceReductions': [colorDomains['PctOfListingsWithPriceReductions'][8], colorDomains['PctOfListingsWithPriceReductions'][0]],
    'MedianPctOfPriceReduction': [colorDomains['MedianPctOfPriceReduction'][8], colorDomains['MedianPctOfPriceReduction'][0]],
    'ZriPerSqft': [colorDomains['ZriPerSqft'][8], colorDomains['ZriPerSqft'][0]] 

activeDimension = dimensions[0]
[nationalData, usGeo, timeSlice] = [{}, null, null]

bb =
    map:
        x: 0,
        y: 0,
        width: canvasWidth - constant.rightMargin,
        height: canvasHeight*(2/3)
    graph:
        x: constant.leftMargin,
        y: canvasHeight*(2/3) + constant.verticalSeparator,
        width: canvasWidth - constant.rightMargin - constant.leftMargin,
        height: canvasHeight*(1/3) - (constant.verticalSeparator)
    pc:
        x: canvasWidth - constant.rightMargin + constant.horizontalSeparator,
        y: 0,
        width: constant.rightMargin - constant.horizontalSeparator,
        height: canvasHeight + constant.verticalSeparator

# CHOROPLETH
mapContainer = svg.append("g")
    .attr("transform", "translate(#{bb.map.x}, #{bb.map.y})")

# Clipping mask
mapContainer.append("clipPath")
    .attr("id", "mapClip")
    .append("rect")
    .attr("width", bb.map.width)
    .attr("height", bb.map.height)

mapMask = mapContainer.append("g").attr("clip-path", "url(#mapClip)")

mapFrame = mapMask.append("g")
    .attr("id", "mapFrame")
    .attr("width", bb.map.width)
    .attr("height", bb.map.height)
    .style("stroke-width", "#{constant.stateBorderWidth}px")

blockContextMenu = (event) ->
    event.preventDefault()

# Block context menu on right click, but only when within mapFrame - allows us to hijack right click
document.querySelector('#mapFrame').addEventListener('contextmenu', blockContextMenu)

activeCounty = d3.select(null)
zoomChoropleth = (d) ->
    return resetChoropleth() if (activeCounty.node() == this)
    activeCounty.classed("active", false)
    activeCounty = d3.select(this).classed("active", true)

    bounds = path.bounds(d)
    dx = bounds[1][0] - bounds[0][0] + constant.zoomBox
    dy = bounds[1][1] - bounds[0][1] + constant.zoomBox
    x = (bounds[0][0] + bounds[1][0])/2
    y = (bounds[0][1] + bounds[1][1])/2
    scale = 0.9/Math.max(dx/bb.map.width, dy/bb.map.height)
    translate = [bb.map.width/2 - scale*x, bb.map.height/2 - scale*y]

    mapFrame.transition()
        .duration(constant.choroplethDuration)
        .style("stroke-width", "#{constant.stateBorderWidth/scale}px")
        .attr("transform", "translate(#{translate})scale(#{scale})")
    
resetChoropleth = () ->
    activeCounty.classed("active", false)
    activeCounty = d3.select(null)

    mapFrame.transition()
        .duration(constant.choroplethDuration)
        .style("stroke-width", "#{constant.stateBorderWidth}px")
        .attr("transform", "")

mapFrame.append("rect")
    .attr("id", "mapBackground")
    .attr("width", bb.map.width)
    .attr("height", bb.map.height)
    .on("click", resetChoropleth)

# GRAPH
graphContainer = svg.append("g")
    .attr("transform", "translate(#{bb.graph.x - constant.leftMargin}, #{bb.graph.y - constant.verticalSeparator})")

# Clipping mask
graphContainer.append("clipPath")
    .attr("id", "graphClip")
    .append("rect")
    .attr("width", bb.graph.width + constant.leftMargin + constant.graphClipHorizontalOffset)
    .attr("height", bb.graph.height + constant.verticalSeparator + constant.graphClipVerticalOffset)

graphMask = graphContainer.append("g").attr("clip-path", "url(#graphClip)")

graphFrame = graphMask.append("g")
    .attr("transform", "translate(#{constant.leftMargin}, #{constant.verticalSeparator})")
    .attr("id", "graphFrame")
    .attr("width", bb.map.width)
    .attr("height", bb.map.height)

parseDate = d3.time.format("%Y-%m").parse

graphXScale = d3.time.scale().range([0, bb.graph.width]).clamp(true)
graphYScale = d3.scale.linear().range([bb.graph.height, constant.verticalSeparator/2])

graphXAxis = d3.svg.axis().scale(graphXScale).orient("bottom")
graphYAxis = d3.svg.axis().scale(graphYScale)
    # Avoid crowding of y-axis by using approx. 5 ticks
    .ticks([5])
    .orient("left")

graphLine = d3.svg.line()
    .interpolate("linear")
    .x((d, i) -> graphXScale(nationalData.dates[i]))
    .y((d) -> graphYScale(+d))

scaleY = (countyArray, nationalValues) ->
    # Scale y-axis domain to fit max of all values to be graphed - consider national and county values
    allValues = [].concat(nationalValues.map((n) -> +n))
    for point in countyArray
        allValues.push(+point)
    graphYScale.domain(d3.extent(allValues))
    graphFrame.select(".y.axis")
        .transition().duration(constant.graphDuration)
        .call(graphYAxis)

countyAdded = false
graphedCountyId = null
zeroes = []
modifyGraph = (d, nationalValues) ->
    # Don't regraph a county if it's already on the graph
    if d.id == graphedCountyId
        return
    else
        graphedCountyId = d.id

    countyArray = d.properties[activeDimension]

    # Currently graphs blanks ("") as 0...
    if !countyAdded
        countyAdded = true

        # Nudge initial title to the left
        graphFrame.select(".title.national")
            .transition().duration(constant.graphDuration)
            .attr("transform", (d) -> "translate(#{bb.graph.width/2 + constant.nationalTitleOffset}, 0)")

        # Append and slide in "vs."
        graphFrame.append("text")
            .attr("class", "title vs")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(#{bb.graph.width*1.5}, 0)")
            .style("opacity", 0)
            .text("vs.")
        graphFrame.select(".title.vs")
            .transition().duration(constant.graphDuration)
            .style("opacity", 1)
            .attr("transform", "translate(#{bb.graph.width/2 + constant.vsOffset}, 0)")

        # Append and slide in county name
        graphFrame.append("text")
            .attr("class", "title county")
            .attr("text-anchor", "start")
            .attr("transform", "translate(#{bb.graph.width*1.5}, 0)")
            .style("opacity", 0)
            .text("#{d.properties.name}")
        graphFrame.select(".title.county")
            .transition().duration(constant.graphDuration)
            .style("opacity", 1)
            .attr("transform", "translate(#{bb.graph.width/2 + constant.countyTitleOffset}, 0)")

        scaleY(countyArray, nationalValues)

        # Adjust national line and points to new scale
        graphFrame.select(".line.national")
            .transition().duration(constant.graphDuration)
            .attr("d", graphLine)
        graphFrame.selectAll(".point.national")
            .transition().duration(constant.graphDuration)
            .attr("transform", (d, i) -> "translate(#{graphXScale(nationalData.dates[i])}, #{graphYScale(d)})")

        zeroes = []
        countyArray.forEach(() -> zeroes.push(0))

        # Place new line and points along x-axis
        graphFrame.append("path")
            .datum(zeroes)
            .attr("class", "line county invisible")
            .attr("d", graphLine)
        graphFrame.selectAll(".point.county.invisible")
            .data((zeroes))
            .enter()
            .append("circle")
            .attr("class", "point county invisible")
            .attr("transform", (d, i) -> "translate(#{graphXScale(nationalData.dates[i])}, #{graphYScale(d)})")
            .attr("r", 3)
        # "Inflate" new line and points, matching with selected county's data
        graphFrame.select(".line.county.invisible")
            .datum(countyArray)
            .attr("class", "line county")
            .transition().duration(constant.graphDuration)
            .attr("d", graphLine)
        graphFrame.selectAll(".point.county.invisible")
            .data((countyArray))
            .attr("class", "point county")
            .transition().duration(constant.graphDuration)
            .attr("transform", (d, i) -> "translate(#{graphXScale(nationalData.dates[i])}, #{graphYScale(d)})")
    else
        # Slide down county name and remove, add new county name above and slide down
        graphFrame.select(".title.county")
            .transition().duration(constant.graphDuration/2)
            .attr("transform", "translate(#{bb.graph.width/2 + constant.countyTitleOffset}, #{constant.verticalSeparator})")
            .style("opacity", 0)
            .remove()
        graphFrame.append("text")
            .attr("class", "title county")
            .attr("text-anchor", "start")
            .attr("transform", "translate(#{bb.graph.width/2 + constant.countyTitleOffset}, #{-constant.verticalSeparator})")
            .style("opacity", 0)
            .text("#{d.properties.name}")
            .transition().delay(constant.graphDuration/2).duration(constant.graphDuration/2)
            .attr("transform", "translate(#{bb.graph.width/2 + constant.countyTitleOffset}, 0)")
            .style("opacity", 1)

        scaleY(countyArray, nationalValues)

        # Adjust national line and points to new scale
        graphFrame.select(".line.national")
            .transition().duration(constant.graphDuration)
            .attr("d", graphLine)
        graphFrame.selectAll(".point.national")
            .transition().duration(constant.graphDuration)
            .attr("transform", (d, i) -> "translate(#{graphXScale(nationalData.dates[i])}, #{graphYScale(d)})")

        # Adjust existing county line and points
        graphFrame.select(".line.county")
            .datum(countyArray)
            .transition().duration(constant.graphDuration)
            .attr("d", graphLine)
        graphFrame.selectAll(".point.county")
            .data((countyArray))
            .transition().duration(constant.graphDuration)
            .attr("transform", (d, i) -> "translate(#{graphXScale(nationalData.dates[i])}, #{graphYScale(d)})")

# PARALLEL COORDINATES
pcFrame = svg.append("g")
    .attr("id", "pcFrame")
    .attr("transform", "translate(#{bb.pc.x}, #{bb.pc.y})")

# Used for centering map
mapX = bb.map.width/2
mapY = bb.map.height/2

projection = d3.geo.albersUsa()
    .scale(1.4*windowHeight)
    .translate([mapX, mapY])
path = d3.geo.path().projection(projection)

color = d3.scale.threshold()
    .domain([0,25,50,75,125,150,200,500,1500])
    .range(colorbrewer.YlGn[9])

#############
## PC PLOT ##
#############

compressedData = []
[pcForeground, pcBackground, pcNational] = [null,null,null]

# Draw parallel coordinates
pcy = d3.scale.ordinal().rangePoints([0, bb.pc.height], constant.pcOffset)
pcx = {}
for dimension in dimensions
    pcx[dimension] = d3.scale.linear()
        .range([0, bb.pc.width])

line = d3.svg.line()
axis = d3.svg.axis().orient("bottom").ticks([4])

# Set the scale for spacing the axes vertically
pcy.domain(dimensions)

# Get rid of geometry data for the PC plot
compressData = (data) ->
    compressedData = []
    for countyData in data
        properties = countyData.properties
        dataPoint = {"id": +countyData.id}
        add = true
        for dimension in dimensions
            if properties[dimension].length == 0
                add = false
                continue
            dataPoint[dimension] = properties[dimension]
        if add
            compressedData.push(dataPoint)
    return compressedData

# Return path for a given data point
pcPath = (d) -> 
    line(dimensions.map((dimension) -> 
        if d[dimension][timeSlice] == ""
            return [bb.pc.width/2, pcy(dimension)]
        return [pcx[dimension](+d[dimension][timeSlice]), pcy(dimension)]))

# Handles a brush event, toggling display of foreground lines
brush = () ->
    activeCounties = {}
    actives = dimensions.filter((p) -> return !pcx[p].brush.empty())
    extents = actives.map((p) -> return pcx[p].brush.extent())
    pcForeground.style("display", (d) ->
        allmet = actives.every((p, i) -> 
            value = d[p][timeSlice]
            return (extents[i][0] <= value) and (value <= extents[i][1]))
        if allmet == true
            activeCounties[+d.id] = true
        if allmet == false
            activeCounties[+d.id] = false
            return "none"
    )

    # Loop through the counties and hide them if they do not meet the PC brush extents
    counties.classed("hidden",(e) ->
        countyID = +e.id
        if (countyID of activeCounties) == false
            if extents.length > 0
                return true
            return false
        else if activeCounties[countyID]
            return false
        return true
        )

    # Hide national data line if not selected
    pcNational.style("display", (d) ->
        allmet = actives.every((p, i) -> 
            value = d[p][timeSlice]
            return (extents[i][0] <= value) and (value <= extents[i][1]))
        if allmet == false
            return "none"
    )

# Checks if a county contains all the data for the current time slice
containsAll = (d) ->
    add = true
    for dimension in dimensions
        if d[dimension][timeSlice] == ""
            add = false
            continue
    return add

drawPC = () ->
    allCountyValues = {}

    for dimension in dimensions
        allCountyValues[dimension] = []

    # Only use counties that have data for the current time slice
    for countyData in compressedData
        addedData = {}
        add = true
        for dimension in dimensions
            if countyData[dimension][timeSlice] == ""
                add = false
                continue
            addedData[dimension] = +countyData[dimension][timeSlice]
        if add == true
            for dimension in dimensions
                allCountyValues[dimension].push(addedData[dimension])

    # Find the min and max values for each dimension to set the domains of the axes
    for dimension in dimensions
        dimensionExtent = d3.extent(allCountyValues[dimension])
        pcScales[dimension] = [dimensionExtent[0]*0.9, dimensionExtent[1]*1.05]

    # Set the domain for the scales
    for dimension in dimensions
        pcx[dimension].domain(pcScales[dimension])

    # Change the axes 
    d3.selectAll(".pcAxis")
        .each((d) -> d3.select(this).call(axis.scale(pcx[d])) )

    # Adjust the line paths for the background, foreground, and national lines
    pcBackground
        .attr("d",pcPath)
        .attr("class",(d) ->
            if containsAll(d) == false
                return "hidden"     
            )

    pcForeground
        .attr("d",pcPath)
        .attr("class",(d) ->
            if containsAll(d) == false
                return "hidden"     
            )

    pcNational.attr("d", pcPath)

    # for d in dimensions
    #     pcx[d].brush = d3.svg.brush().x(pcx[d]).on("brush", brush)
    brush()
    # 

    # Change the brush
    # d3.selectAll(".pcBrush")
    #     .each((d) -> d3.select(this).call(pcx[d].brush = d3.svg.brush().x(pcx[d]).on("brush", brush)))
    #     .selectAll("rect")
    #     .attr("y", -8)
    #     .attr("height", 16)

[allCountyData, counties] = [null, null]
drawVisualization = (firstTime) ->
    nationalValues = nationalData[activeDimension]
    color.domain(colorDomains[activeDimension])

    # CHOROPLETH MAP
    if firstTime
        allCountyData = topojson.feature(usGeo, usGeo.objects.counties).features

        backgroundCounties = mapFrame.append("g")
            .selectAll(".backgroundCounty")
            .data(allCountyData)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", "#d9d9d9")
            .style("opacity", 1.0)
            # On left click
            .on("click", zoomChoropleth)

        counties = mapFrame.append("g")
            .attr("id", "counties")
            .selectAll(".county")
            .data(allCountyData)
            .enter()
            .append("path")
            .attr("class", (d) -> "county c#{+d.id}")
            .attr("d", path)
            .style("fill", (d) ->
                countyData = d.properties[activeDimension]
                if countyData.length == 0
                    return "#d9d9d9"
                else
                    if countyData[timeSlice] == ""
                        return "#d9d9d9"
                    else
                        return color(countyData[timeSlice])
            )
            .style("opacity", 1.0)
            # On left click
            .on("click", zoomChoropleth)

        mapFrame.append("path")
            .attr("id", "state-borders")
            .datum(topojson.mesh(usGeo, usGeo.objects.states, (a, b) -> a != b))
            .attr("d", path)
    else
        counties.transition().duration(constant.recolorDuration)
            .style("fill", (d) ->
                countyData = d.properties[activeDimension]
                if countyData.length == 0
                    return "#d9d9d9"
                else
                    if countyData[timeSlice] == ""
                        return "#d9d9d9"
                    else
                        return color(countyData[timeSlice])
            )

    # On right click
    counties.on("contextmenu", (d) ->
        # Make only counties with data during the current time slice right-clickable
        if d.properties[activeDimension].length == 0
            return
        else if d.properties[activeDimension][timeSlice] == ""
            return
        else
            modifyGraph(d, nationalValues)
    )

    counties.on("mouseover", (d) ->
        if d.properties[activeDimension].length == 0
            # do nothing
        else if d.properties[activeDimension][timeSlice] == ""
            # do nothing
        else
            # Only lower opacity for counties with data during this time slice
            d3.select(this).style("opacity", 0.8)

        d3.select("#tooltip")
            .style("left", "#{d3.event.pageX + constant.tooltipOffset}px")
            .style("top", "#{d3.event.pageY + constant.tooltipOffset}px")
        d3.select("#county").text(d.properties.name)
        d3.select("#tooltip").classed("hidden", false)
    )

    counties.on("mouseout", (d) ->
        d3.select("#tooltip").classed("hidden", true)
        d3.select(this)
            .transition().duration(250)
            .style("opacity", 1.0)
    )

    # PARALLEL COORDINATES
    if firstTime
        compressedData = compressData(allCountyData)

        # Add grey background lines for context.
        pcBackground = pcFrame.append("g")
            .attr("class", "pcBackground")
            .selectAll("path")
            .data(compressedData)
            .enter()
            .append("path")

        # Add blue foreground lines for focus.
        pcForeground = pcFrame.append("g")
            .attr("class", "pcForeground")
            .selectAll("path")
            .data(compressedData)
            .enter()
            .append("path")

        # Add national data line
        pcNational = pcFrame.append("g")
            .datum(nationalData)
            .attr("class", "pcNational")
            .append("path")

        #Add a group element for each dimension.
        g = pcFrame.selectAll(".dimension")
            .data(dimensions)
            .enter().append("g")
            .attr("class", "dimension")
            .attr("transform", (d) -> return "translate(0, #{pcy(d)})")

        # Add an axis and title.
        g.append("g")
            .attr("class", "pcAxis")
            .append("text")
            .attr("text-anchor", "end")
            .attr("x", bb.pc.width)
            .attr("y", -9)
            .text((d) -> labels[d])

        # Add and store a brush for each axis.
        g.append("g")
            .attr("class", "pcBrush")
            .each((d) -> d3.select(this).call(pcx[d].brush = d3.svg.brush().x(pcx[d]).on("brush", brush)))
            .selectAll("rect")
            .attr("y", -8)
            .attr("height", 16)

        drawPC()

    # GRAPH
    graphYScale.domain(d3.extent(nationalValues))

    if firstTime
        graphXScale.domain([nationalData.dates[0], nationalData.dates[nationalData.dates.length - 1]])
        graphFrame.append("g").attr("class", "x axis")
            .attr("transform", "translate(0, #{bb.graph.height})")
            .call(graphXAxis)
        graphFrame.append("g").attr("class", "y axis")
            .call(graphYAxis)

        graphFrame.append("text")
            .attr("class", "title national")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(#{bb.graph.width/2}, 0)")
            .text("National Trend")
        graphFrame.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", constant.labelY)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text(labels[activeDimension])

        graphFrame.append("path")
            .datum(nationalData[activeDimension])
            .attr("class", "line national")
            .attr("d", graphLine)
        graphFrame.selectAll(".point.national")
            .data((nationalData[activeDimension]))
            .enter()
            .append("circle")
            .attr("class", "point national")
            .attr("transform", (d, i) -> "translate(#{graphXScale(nationalData.dates[i])}, #{graphYScale(+d)})")
            .attr("r", 3)

        # Configure slider
        sliderScale = d3.scale.linear()
            .domain([0, nationalValues.length - 1])
            .range([0, bb.graph.width])
            .clamp(true)

        brushed = () ->
            value = Math.round(brush.extent()[0])

            if d3.event.sourceEvent
                value = Math.round(sliderScale.invert(d3.mouse(this)[0]))
                brush.extent([value, value])

            handle.attr("cx", sliderScale(value))

            timeSlice = value
            counties.style("fill", (d) ->
                countyData = d.properties[activeDimension]
                if countyData.length == 0
                    return "#d9d9d9"
                else
                    if countyData[timeSlice] == ""
                        return "#d9d9d9"
                    else
                        return color(countyData[timeSlice])
            )

            # drawPC()

        brush = d3.svg.brush()
            .x(graphXScale)
            .extent([0, 0])
            .on("brush", brushed)

        slider = graphFrame.append("g")
            .attr("class", "slider")
            .attr("transform", "translate(0, #{bb.graph.height})")
            .call(brush)
        slider.selectAll(".extent,.resize").remove()
        handle = slider.append("circle")
            .attr("class", "handle")
            .attr("r", 7)

        # handle.on("mouseover", (d) ->
        #     handle.attr("r", 8)
        # )
        # handle.on("mouseout", (d) ->
        #     handle.attr("r", 7)
        # )

    else
        graphFrame.select(".y.axis")
            .transition().duration(constant.graphDurationDimSwitch)
            .call(graphYAxis)

        graphFrame.select(".title.vs")
            .transition().duration(constant.graphDurationDimSwitch)
            .attr("transform", "translate(#{bb.graph.width/2 + constant.vsOffset}, #{constant.verticalSeparator})")
            .style("opacity", 0)
            .remove()
        graphFrame.select(".title.county")
            .transition().duration(constant.graphDurationDimSwitch)
            .attr("transform", "translate(#{bb.graph.width/2 + constant.countyTitleOffset}, #{constant.verticalSeparator})")
            .style("opacity", 0)
            .remove()
        graphFrame.select(".title.national")
            .transition().duration(constant.graphDurationDimSwitch)
            .attr("transform", "translate(#{bb.graph.width/2}, 0)")

        # Fade out
        graphFrame.select(".y.label")
            .transition().duration(constant.graphDurationDimSwitch/2)
            .style("opacity", 0)
        graphFrame.select(".y.label")
            .transition().delay(constant.graphDurationDimSwitch/2).duration(constant.graphDurationDimSwitch/2)
            .text(labels[activeDimension])
            .style("opacity", 1)

        graphFrame.select(".line.county").remove()
        graphFrame.selectAll(".point.county").remove()
        
        # Redraw national line with new data
        graphFrame.select(".line.national")
            .datum(nationalData[activeDimension])
            .transition().duration(constant.graphDurationDimSwitch)
            .attr("d", graphLine)
        
        # Move existing points
        graphFrame.selectAll(".point.national")
            .data((nationalData[activeDimension]))
            .transition().duration(constant.graphDurationDimSwitch)
            .attr("transform", (d, i) -> "translate(#{graphXScale(nationalData.dates[i])}, #{graphYScale(d)})")

firstTime = true
d3.selectAll("input[name='dimensionSwitch']").on("click", () ->
    # Don't do anything if this radio button is already filled
    if +this.value == dimensions.indexOf(activeDimension)
        return
    else
        activeDimension = dimensions[this.value]
        countyAdded = false
        graphedCountyId = null
        drawVisualization(firstTime)
)

# Loading progress indicator
# twoPi = 2 * Math.PI
# progress = 0
# total = 8367882
# formatPercent = d3.format(".0%")

# arc = d3.svg.arc()
#     .startAngle(0)
#     .innerRadius(180)
#     .outerRadius(240)

loadingContainer = svg.append("g")
    .attr("transform", "translate(#{canvasWidth/2}, #{canvasHeight/2})")

meter = loadingContainer.append("g")
    .attr("class", "progress-meter")

# meter.append("path")
#     .attr("class", "background")
#     .attr("d", arc.endAngle(twoPi))

# foreground = meter.append("path")
#     .attr("class", "foreground")

text = meter.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", ".35em")
    .text("Loading...")

# Import data and perform final processing
# d3.json("../data/compressed-nationwide-data.json", (nationwide) ->
#     d3.json("../data/compressed-augmented-us-states-and-counties.json", (us) ->
#         [nationalData, usGeo] = [nationwide, us]
#         nationalData.dates = nationalData.dates.map((dateString) -> parseDate(dateString))
#         drawVisualization(firstTime)
#         firstTime = !firstTime
#     )
# )
d3.json("../data/compressed-nationwide-data.json", (nationwide) ->
    d3.json("../data/compressed-augmented-us-states-and-counties.json")
        # .on("progress", () ->
        #     interpolator = d3.interpolate(progress, d3.event.loaded / total)
        #     d3.transition().tween("progress", () ->
        #         (t) -> 
        #             progress = interpolator(t)
        #             foreground.attr("d", arc.endAngle(twoPi * progress))
        #             text.text(formatPercent(progress))
        #     )
        # )
        .get((error, us) ->
            meter.transition().delay(250).attr("transform", "scale(0)")
            
            [nationalData, usGeo] = [nationwide, us]
            nationalData.dates = nationalData.dates.map((dateString) -> parseDate(dateString))
            # timeSlice = nationalData.dates.length - 1
            timeSlice = 0
            drawVisualization(firstTime)
            firstTime = !firstTime
        )
)
