// parsing data dari csv
d3.csv("./data/DCOILWTICO.csv", type, function(error, data) {
  if (error) throw error;

  // ukuran chart
  var margin = {top: 20, right: 20, bottom: 20, left: 50},
      width = 520 - margin.left - margin.right,
      height = 220 - margin.top - margin.bottom;

  // bikin skala x-axis dan y-axis
  var x = d3.time.scale()
      .range([20, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  // bikin fungsi konversi data ke koordinat garis
  var line = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); });

  // append svg ke komponen tertentu di html
  var svg = d3.select("div#production").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // domain skala grafik
  x.domain(d3.extent(data, function(d) { return d.date; })); // skala x-axis sesuai range data
  y.domain([0, 110]); // skala y-axis dari 0 sampe 110

  // draw x-axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // draw y-axis
  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Price ($)");

  // draw line
  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);
});