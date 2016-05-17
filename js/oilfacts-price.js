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
      .orient("right");

  // bikin fungsi konversi data ke koordinat garis
  var priceline = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.value); });

  var productionline = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y2(d.value); });

  // append svg ke komponen tertentu di html
  var svg = d3.select("div#price").append("svg")
      .attr("width", width + margin.left + margin.right + 68)
      .attr("height", height + margin.top + margin.bottom + 30)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var lineSvg = svg.append("g");

  var focus = svg.append("g") 
      .style("display", "none");

  var priceTip = d3.select("div#price-stat").text("Price :");
  var productionTip = d3.select("div#production-stat").text("Production :");

  // Parse the date / time
  var parseDate = d3.time.format("%Y").parse,
      formatDate = d3.time.format("%Y"),
      bisectDate = d3.bisector(function(d) { return d.date; }).left;

  var countrySel = d3.select("#countrySelector");

  var year = [];
  var collection = [];
  // parsing data dari csv
  d3.csv("./data/DCOILWTICO.csv", function(error, data) {
    if (error) throw error;

    data.forEach(function(d) {
        d.date = parseDate(d.date);
        year.push(d.date);
        d.value = +d.value;
    });

    d3.csv("./data/Total_Oil_Supply.csv", function(error,country) {
      if (error) throw error;
      var idxCountry=0;
      country.forEach(function(d){
          var value = [d[1986], d[1987], d[1988], d[1989], d[1990], d[1991], d[1992], d[1993], d[1994], d[1995], d[1996], d[1997], d[1998], d[1999], d[2000], d[2001], d[2002], d[2003], d[2004], d[2005], d[2006], d[2007], d[2008], d[2009], d[2010], d[2011], d[2012], d[2013], d[2014]];
          var data2 = {
            Country: d.Country,
            Data: []
          };
          var i=0;
          value.forEach(function(x){
            var sd = new Object();
            sd.value = parseFloat(x);
            sd.date = year[i];
            data2.Data.push(sd);
            i++;
          });
          var option=countrySel.append("option").text(data2.Country).attr("value",idxCountry);
          if(data2.Country=="World (total)")
            option.attr("selected",true);
          collection.push(data2);
          idxCountry = idxCountry + 1;
      });
      
      // domain skala grafik
      x.domain(d3.extent(data, function(d) { return d.date; })); // skala x-axis sesuai range data
      y.domain([0, 110]); // skala y-axis dari 0 sampe 110
      y2.domain([0,d3.max(collection[countrySel.node().value].Data, function(d) { return d.value })]);

      // Add the priceline path.
      lineSvg.append("path")
          .attr("class", "line")
          .attr("d", priceline(data));

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

      var prodLine = lineSvg.append("path")
                      .attr("class", "line")
                      .attr("id", "green")
                      .attr("d", productionline(collection[countrySel.node().value].Data));

      // Add the Y2 Axis
      var prodAxis = svg.append("g")
                      .attr("class", "y axis")
                      .attr("transform", "translate(" + width + ",0)")
                      .call(y2Axis);

      prodAxis.append("text")
              .attr("transform", "translate(80,-30)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .text("Production (barrel/day)");

      // append the circle at the intersection
      focus.append("circle")
          .attr("class", "y")
          .style("fill", "none")
          .style("stroke", "blue")
          .attr("r", 4);

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
            j = bisectDate(collection[countrySel.node().value].Data, x0, 1),
            p0 = collection[countrySel.node().value].Data[j - 1],
            p1 = collection[countrySel.node().value].Data[j],
            p = x0 - p0.date > p1.date - x0 ? p1 : p0,
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

        priceTip.text("Price : "+d.value);
        productionTip.text("Production : "+p.value);

        focus.select("circle.y")
            .attr("transform",
                  "translate(" + x(d.date) + "," +
                                 y(d.value) + ")");

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

      function draw() {
        prodAxis.remove();
        prodLine.remove();
        y2.domain([0,d3.max(collection[countrySel.node().value].Data, function(d) { return d.value })]);
        // Redraw Y2 axis
        prodLine = lineSvg.append("path")
            .attr("class", "line")
            .attr("id", "green")
            .attr("d", productionline(collection[countrySel.node().value].Data));

        // Redraw the Y2 Axis
        prodAxis = svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + width + ",0)")
            .call(y2Axis);
        prodAxis.append("text")
            .attr("transform", "translate(80,-30)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Production (barrel/day)");
      }
      draw();
      countrySel.on("change",draw);
    });
  });

  
  
}