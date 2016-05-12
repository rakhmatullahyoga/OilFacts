function loadGraph() {
  // ukuran chart
  var margin = {top: 30, right: 20, bottom: 20, left: 50},
      width = 580 - margin.left - margin.right,
      height = 240 - margin.top - margin.bottom;

  // bikin skala x-axis dan y-axis
  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var y2 = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom").ticks(5);

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left").ticks(5);

  var y2Axis = d3.svg.axis()
      .scale(y2)
      .orient("right").ticks(5);

  // bikin fungsi konversi data ke koordinat garis
  var valueline = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); });

  // append svg ke komponen tertentu di html
  var svg = d3.select("div#price").append("svg")
      .attr("width", width + margin.left + margin.right + 68)
      .attr("height", height + margin.top + margin.bottom + 30)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var lineSvg = svg.append("g"); 

  var focus = svg.append("g") 
      .style("display", "none");

  // Parse the date / time
  var parseDate = d3.time.format("%Y").parse,
      formatDate = d3.time.format("%Y"),
      bisectDate = d3.bisector(function(d) { return d.date; }).left;

  // parsing data dari csv
  d3.csv("./data/DCOILWTICO.csv", function(error, data) {
    if (error) throw error;

    data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.value = +d.value;
    });

    // domain skala grafik
    x.domain(d3.extent(data, function(d) { return d.date; })); // skala x-axis sesuai range data
    y.domain([0, 110]); // skala y-axis dari 0 sampe 110
    y2.domain([0,14000]);

    // Add the valueline path.
    lineSvg.append("path")
        .attr("class", "line")
        .attr("d", valueline(data));

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "translate(60,-30)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Price ($/barrel)");

    // Add the Y2 Axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + ",0)")
        .call(y2Axis)
      .append("text")
        .attr("transform", "translate(80,-30)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Production (barrel/day)");

    // append the x line
    focus.append("line")
        .attr("class", "x")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("y1", 0)
        .attr("y2", height);

    // append the y line
    focus.append("line")
        .attr("class", "y")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("x1", width)
        .attr("x2", width);

    // append the circle at the intersection
    focus.append("circle")
        .attr("class", "y")
        .style("fill", "none")
        .style("stroke", "blue")
        .attr("r", 4);

    // place the value at the intersection
    focus.append("text")
        .attr("class", "y1")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "-.3em");
    focus.append("text")
        .attr("class", "y2")
        .attr("dx", 8)
        .attr("dy", "-.3em");

    // place the date at the intersection
    focus.append("text")
        .attr("class", "y3")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "1em");
    focus.append("text")
        .attr("class", "y4")
        .attr("dx", 8)
        .attr("dy", "1em");
    
    // append the rectangle to capture mouse
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.date > d1.date - x0 ? d1 : d0;

      focus.select("circle.y")
          .attr("transform",
                "translate(" + x(d.date) + "," +
                               y(d.value) + ")");

      focus.select("text.y1")
          .attr("transform",
                "translate(" + x(d.date) + "," +
                               y(d.value) + ")")
          .text(d.value);

      focus.select("text.y2")
          .attr("transform",
                "translate(" + x(d.date) + "," +
                               y(d.value) + ")")
          .text(d.value);

      focus.select("text.y3")
          .attr("transform",
                "translate(" + x(d.date) + "," +
                               y(d.value) + ")")
          .text(formatDate(d.date));

      focus.select("text.y4")
          .attr("transform",
                "translate(" + x(d.date) + "," +
                               y(d.value) + ")")
          .text(formatDate(d.date));

      focus.select(".x")
          .attr("transform",
                "translate(" + x(d.date) + "," +
                               y(d.value) + ")")
                     .attr("y2", height - y(d.value));

      focus.select(".y")
          .attr("transform",
                "translate(" + width * -1 + "," +
                               y(d.value) + ")")
                     .attr("x2", width + width);
    }
  });
}