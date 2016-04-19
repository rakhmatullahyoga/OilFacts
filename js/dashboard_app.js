// Welcome to the RazorFlow Dashbord Quickstart. Simply copy this "dashboard_quickstart"
// to somewhere in your computer/web-server to have a dashboard ready to use.
// This is a great way to get started with RazorFlow with minimal time in setup.
// However, once you're ready to go into deployment consult our documentation on tips for how to 
// maintain the most stable and secure 

StandaloneDashboard(function(db){
	var db = new EmbeddedDashboard ();

    var chart2 = new ChartComponent();
    chart2.setDimensions (8, 4);
    chart2.setCaption("Map");    
    chart2.setLabels (["A", "B", "C"]);
    chart2.addSeries("series_1", "Series 1", [1, 2, 3]);
    db.addComponent (chart2);

    var chart = new ChartComponent();
    chart.setDimensions (4, 2);
    chart.setCaption("Harga minyak dunia");    
    chart.setLabels (["Jan", "Feb", "Mar"]);
    chart.addSeries ("beverages", "Beverages", [1355, 1916, 1150]);
    chart.addSeries ("packaged_foods", "Packaged Foods", [1513, 976, 1321]);
    db.addComponent (chart);

    var chart4 = new ChartComponent();
    chart4.setDimensions (4, 2);
    chart4.setCaption("Produksi minyak negara X");    
    chart4.setLabels (["Jan", "Feb", "Mar"]);
    chart4.addSeries ("beverages", "Beverages", [1355, 1916, 1150]);
    chart4.addSeries ("packaged_foods", "Packaged Foods", [1513, 976, 1321]);
    db.addComponent (chart4);

    var chart3 = new ChartComponent();
    chart3.setDimensions (12, 1);
    chart3.setCaption("Panel input");    
    chart3.setLabels (["Jan", "Feb", "Mar"]);
    chart3.addSeries ("beverages", "Beverages", [1355, 1916, 1150]);
    chart3.addSeries ("packaged_foods", "Packaged Foods", [1513, 976, 1321]);
    db.addComponent (chart3);

    chart.onItemClick (function (params) {
        chart2.updateSeries ("series_1", [3, 5, 2]);
    });

    db.embedTo("dashboard_target");
});