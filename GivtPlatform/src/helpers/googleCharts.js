/**
 * Created by bjorn_ss08m1t on 7/11/2016.
 */
export class GoogleCharts{
    constructor(){
        this.scriptURL = "https://www.gstatic.com/charts/loader.js";

        var scriptElement = document.createElement('script');

        scriptElement.src = this.scriptURL;
        scriptElement.onload = () => {
            // do anything you need to do here, or call a VM method
            console.log("loaded");

            console.log("started loading");
            google.charts.load("visualization", "1", {packages:["corechart"]});
            console.log("loaded the visualization");
            google.charts.setOnLoadCallback(drawChart);
            function drawChart() {
                var dataTable = new google.visualization.DataTable();
                dataTable.addColumn('string', 'Bedrag');
                dataTable.addColumn('number', 'Euro');
                // A column for custom tooltip content
                dataTable.addColumn({type: 'string', role: 'tooltip'});
                dataTable.addRows([
                    ['', 90,'€ 456 goedgekeurd!']
                    /*
                    ['', 8, '€ 128 in verwerking'],
                    ['', 2, '€ 20 ingehouden']*/
                ]);

                var options = {
                    pieSliceBorderColor: 'transparent',
                    width: 280,
                    height: 280,
                    chartArea: {'width': '100%', 'height': '80%'},
                    colors: ['#42C98E','#F4BF63','#4F98CF'],
                    legend: {position: 'none'},
                    pieHole: 0.85,
                    pieSliceText: 'label',
                    pieStartAngle: 0,
                    pieSliceTextStyle:{color: 'black', fontName: 'arial', fontSize: 10},
                    backgroundColor: 'transparent'
                };

                var chart = new google.visualization.PieChart(document.getElementById('donutchart'));
                chart.draw(dataTable, options);
            }

            console.log("loaded google charts");
        };

        this.scriptElementInHead = document.querySelector('head').appendChild(scriptElement);
    }
}
