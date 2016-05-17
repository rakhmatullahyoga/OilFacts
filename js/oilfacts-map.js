// variable
var config = {"data0":"Country","label0":"label 0","label1":"label 1","color0":"#ffcc99","color1":"#cc6700","width":800,"height":400}

// canvas
var width = 1000,
	height = 640,
	centered;

// range color
var COLOR_COUNTS = 9;

/** color var */
var COLOR_FIRST = config.color0, COLOR_LAST = config.color1;

var rgb = hexToRgb(COLOR_FIRST);

var COLOR_START = new Color(rgb.red, rgb.green, rgb.blue);

rgb = hexToRgb(COLOR_LAST);
var COLOR_END = new Color(rgb.red, rgb.green, rgb.blue);

var startColors = COLOR_START.getColors(),
  endColors = COLOR_END.getColors();
  
/** end of color var */

// assing data
var MAP_COUNTRY = config.data0;
var MAP_YEAR = 2014;	// initilizied MAP_YEAR

/** data global */
var countries;
var country = "";
var data1 = [];
var world1 = [];
var worldx = [];
/** end of data global */

/** map var */
var projection = d3.geo.mercator()
				   .center([0, 40])
				   .scale((width + 1) / 2 / Math.PI)
				   .translate([width / 2, height / 2])
				   .precision(.1);
				   
var path = d3.geo.path()
			 .projection(projection);
			 
var graticule = d3.geo.graticule();

var svg_map = d3.select("#map").append("svg")
			.attr("width", width)
			.attr("height", height);
			
svg_map.append("path")
   .datum(graticule)
   .attr("class", "graticule")
   .attr("d", path);

svg_map.append("rect")
   .attr("class", "background")
   .attr("width", width)
   .attr("height", height);
   
svg_map.append("path")
   .datum(graticule)
   .attr("class", "choropleth")
   .attr("d", path);

var g = svg_map.append("g");

g.append("path")
 .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
 .attr("class", "equator")
 .attr("d", path);
   
var valueHash = {}

var quantize = d3.scale.quantize()
      .domain([0, 1.0])
      .range(d3.range(COLOR_COUNTS).map(function(i) { return i }));

var colors = [];

for (var i = 0; i < COLOR_COUNTS; i++) {
	var red = Interpolate(startColors.red, endColors.red, COLOR_COUNTS, i);
	var green = Interpolate(startColors.green, endColors.green, COLOR_COUNTS, i);
	var blue = Interpolate(startColors.blue, endColors.blue, COLOR_COUNTS, i);
	colors.push(new Color(red, green, blue));
	
}

				 
/** end of map var */

// get data from csv
d3.csv("./data/Total_Oil_Supply.csv", function(err, data) {
	// set variable data1
	data1 = data;
	
	// get data by year
	data.forEach(function(d) {
		valueHash[d[MAP_COUNTRY]] = +d[MAP_YEAR];
	});
	
	// set colour
	quantize.domain([d3.min(data, function(d){
		return (+d[MAP_YEAR]) }),
    d3.max(data, function(d){
		return (+d[MAP_YEAR]) })]);
		
	d3.json("./data/world-topo-min.json", function(error, world) {
		
		// set to map
		g.selectAll(".country")
		   .data(topojson.feature(world, world.objects.countries).features)
	   .enter().append("path")
		   .attr("class", "country")
		   .attr("d", path)
		   .attr("id", function(d,i) { return d.id; })
		   .attr("title", function(d) { return d.properties.name; })
		   .style("fill", function(d) {
			   if (valueHash[d.properties.name]) {
				   var c = quantize((valueHash[d.properties.name]));
				   var color = colors[c].getColors();
				   return "rgb(" + color.red + "," + color.green + "," + color.blue + ")";
			   } else {
					return "#ccc";
			   }
		   })
		   .on("mousemove", function(d) {
				var html = "";
	  
				html += "<div class=\"tooltip_kv\">";
				html += "<span class=\"tooltip_key\">";
				html += d.properties.name;
				html += "</span>";
				html += "<span class=\"tooltip_value\">";
				html += (valueHash[d.properties.name] ? valueFormat(valueHash[d.properties.name]) : "N/A");
				html += "";
				html += "</span>";
				html += "</div>";
				
				$("#tooltip-container").html(html);
				$(this).attr("fill-opacity", "0.8");
				$("#tooltip-container").show();
				
				var coordinates = d3.mouse(this);
				
				var map_width = $('.choropleth')[0].getBoundingClientRect().width;
				
				if (d3.event.pageX < map_width / 2) {
				  d3.select("#tooltip-container")
					.style("top", (d3.event.layerY + 15) + "px")
					.style("left", (d3.event.layerX + 15) + "px");
				} else {
				  var tooltip_width = $("#tooltip-container").width();
				  d3.select("#tooltip-container")
					.style("top", (d3.event.layerY + 15) + "px")
					.style("left", (d3.event.layerX - tooltip_width - 30) + "px");
				}
			})
			.on("mouseout", function() {
                $(this).attr("fill-opacity", "1.0");
                $("#tooltip-container").hide();
            });
			   
		g.append("path")
         .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
         .attr("class", "boundary")
         .attr("d", path);
	});
	d3.select(self.frameElement).style("height", height + "px");
});

			

/** Redraw */
function redraw(nTahun){
	
	// get data by year (nTahun)
	data1.forEach(function(d) {
		valueHash[d[MAP_COUNTRY]] = +d[nTahun];
	});
	
	// set colour
	quantize.domain([d3.min(data1, function(d){
		return (+d[nTahun]) }),
    d3.max(data1, function(d){
		return (+d[nTahun]) })]);
		
	// set to map
	g.selectAll(".country")
	   .attr("d", path)
	   .style("fill", function(d) {
		   if (valueHash[d.properties.name]) {
			   var c = quantize((valueHash[d.properties.name]));
			   var color = colors[c].getColors();
			   return "rgb(" + color.red + "," + color.green + "," + color.blue + ")";
		   } else {
				return "#ccc";
		   }
	   })
	   .on("mousemove", function(d) {
			var html = "";
  
			html += "<div class=\"tooltip_kv\">";
			html += "<span class=\"tooltip_key\">";
			html += d.properties.name;
			html += "</span>";
			html += "<span class=\"tooltip_value\">";
			html += (valueHash[d.properties.name] ? valueFormat(valueHash[d.properties.name]) : "N/A");
			html += "";
			html += "</span>";
			html += "</div>";
			
			$("#tooltip-container").html(html);
			$(this).attr("fill-opacity", "0.8");
			$("#tooltip-container").show();
			
			var coordinates = d3.mouse(this);
			
			var map_width = $('.choropleth')[0].getBoundingClientRect().width;
			
			if (d3.event.pageX < map_width / 2) {
			  d3.select("#tooltip-container")
				.style("top", (d3.event.layerY + 15) + "px")
				.style("left", (d3.event.layerX + 15) + "px");
			} else {
			  var tooltip_width = $("#tooltip-container").width();
			  d3.select("#tooltip-container")
				.style("top", (d3.event.layerY + 15) + "px")
				.style("left", (d3.event.layerX - tooltip_width - 30) + "px");
			}
		})
		.on("mouseout", function() {
			$(this).attr("fill-opacity", "1.0");
			$("#tooltip-container").hide();
		});
			   
}
/** end of redraw */

/** Slider */
d3.select("#nRadius").on("input", function() {
	slider(+this.value);
});
slider(MAP_YEAR);

// slider
function slider(slideTahun){
	// adjust the text on the range slider
	d3.select("#nRadius-value").text(slideTahun);
	d3.select("#nRadius").property("value", slideTahun);
	
	redraw(slideTahun);
}
/** end of slider */

// interpolate
function Interpolate(start, end, steps, count) {
  var s = start,
	  e = end,
	  final = s + (((e - s) / steps) * count);
  return Math.floor(final);
}

// color from RGB
function Color(_r, _g, _b) {
  var red, green, blue;
  var setColors = function(_r, _g, _b) {
	  red = _r;
	  green = _g;
	  blue = _b;
  };

  setColors(_r, _g, _b);
  this.getColors = function() {
	  var colors = {
		  red: red,
		  green: green,
		  blue: blue
	  };
	  return colors;
  };
}

// convert color from hex to RGB
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
	  red: parseInt(result[1], 16),
	  green: parseInt(result[2], 16),
	  blue: parseInt(result[3], 16)
  } : null;
}

// number scale
function valueFormat(d) {
	if (d > 1000000000) {
	  return Math.round(d / 1000000000 * 10) / 10 + "B";	// Billion
	} else if (d > 1000000) {
	  return Math.round(d / 1000000 * 10) / 10 + "M";		// Million
	} else if (d > 1000) {
	  return Math.round(d / 1000 * 10) / 10 + "K";			// Thousand (kilo)
	} else {
	  return d;
	}
}