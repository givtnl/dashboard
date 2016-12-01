import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Card } from '../models/card';
import { ApiClientService } from "../services/api-client.service";

@Component({
    selector: 'my-dashboard',
    templateUrl: 'app/html/dashboard.component.html',
    styleUrls: ['./app/css/dashboard.component.css']
})
export class DashboardComponent implements OnInit{
    cards: Card[] = [];
    lastSundayCard: Card = new Card();
    thisMonthCard: Card = new Card();
    isSafari: boolean;
    scriptURL:string;

    constructor(private apiService: ApiClientService){
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      //  this.GoogleCharts = new GoogleCharts();
        this.googleCharts();
    }

    ngOnInit() : void{
        this.fetchLastSundayGivts();
        this.fetchThisMonthGivts();
    }

    googleCharts(){
        console.log("test");
        this.scriptURL = "https://www.gstatic.com/charts/loader.js";

        var scriptElement = document.createElement('script');

        scriptElement.src = this.scriptURL;
        scriptElement.onload = () => {
            // do anything you need to do here, or call a VM method
            google.charts.load("visualization", "1", {packages:["corechart"]});
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
                var container = document.getElementById("donutchart").firstChild.firstChild;
                container.style.width = "100%";
            }
        };

        document.querySelector('head').appendChild(scriptElement);
    }

    fetchThisMonthGivts(){
        let date = new Date();
        let month = date.getUTCMonth()+1;
        let year = date.getFullYear();
        let secondYear = date.getFullYear();
        let nextMonth = month + 1;
        if(month == 12){
            secondYear = date.getFullYear()+1;
            nextMonth = 1;
        }

        let dateBegin = month + "-01-" + year;
        let dateEnd = nextMonth + "-01-" + secondYear;
        let params = "DateBegin=" + dateBegin + "&DateEnd=" + dateEnd + "&Status=" + "0";

        this.apiService.getData("OrgAdminView/Givts/?"+params)
            .then(resp =>
            {
                let collectSum = 0;
                for(let givt in resp){
                    collectSum = collectSum + resp[givt].Amount;
                }
                this.thisMonthCard.value = "€ " + (this.isSafari ? collectSum.toFixed(2) : collectSum.toLocaleString(navigator.language,{minimumFractionDigits: 2}));
                this.thisMonthCard.title = "this month"; //mulitlingual
                let datePipe = new DatePipe();
                this.thisMonthCard.subtitle = datePipe.transform(date, 'MMMM yyyy');
                this.thisMonthCard.footer = "given"; // mulitlingual
                this.cards.push(this.thisMonthCard);
            });
    }

    fetchLastSundayGivts(){
        let date = new Date();
        let day = date.getUTCDay();
        let lastSunday = new Date(date - day*1000*60*60*24);
        let lastSundayDate = lastSunday.getUTCMonth()+1 + "-" + lastSunday.getUTCDate() + "-" + lastSunday.getUTCFullYear();
        let dateBegin =  lastSundayDate + " 00:00:00";
        let dateEnd = lastSundayDate + " 23:59:59";

        this.apiService.getData("OrgAdminView/Givts/?DateBegin="+dateBegin+"&DateEnd="+dateEnd)
            .then(resp =>
            {
                let collectSum = 0;
                for(let givt in resp){
                    collectSum = collectSum + resp[givt].Amount;
                }
                this.lastSundayCard.value = "€ " + (this.isSafari ? collectSum.toFixed(2) : collectSum.toLocaleString(navigator.language,{minimumFractionDigits: 2}));
                this.lastSundayCard.title = "last sunday"; // multilingual
                let datePipe = new DatePipe();
                this.lastSundayCard.subtitle = datePipe.transform(lastSundayDate, 'dd MMMM yyyy');
                this.lastSundayCard.footer = "given"; //mulitlingual
                this.cards.push(this.lastSundayCard);
            });
    }
}
