import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Card } from '../models/card';
import { ApiClientService } from "app/services/api-client.service";
import {TranslateService} from "ng2-translate";

@Component({
    selector: 'my-dashboard',
    templateUrl: '../html/dashboard.component.html',
    styleUrls: ['../css/dashboard.component.css']
})
export class DashboardComponent implements OnInit{
    cards: Card[] = [];
    lastSundayCard: Card = new Card();
    thisMonthCard: Card = new Card();
    thisMonthGiversCard: Card = new Card();
    isSafari: boolean;
    scriptURL: string;
    translate: TranslateService;

    //maybe a new donutcard model?
    donutCard: boolean = false;
    donutCardValue: string;
    donutcardTitle: string;
    donutcardFooter: string;

    constructor(private apiService: ApiClientService,  translate:TranslateService){
        this.translate = translate;
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }

    ngOnInit() : void{
        this.fetchLastSundayGivts();
        this.fetchThisMonthGivts();
        this.fetchThisMonthGivers();
        this.fetchDataContinuously(3000);
    }

    fetchDataContinuously(interval: number){
        setInterval(() => {
            this.fetchThisMonthGivts();
            this.fetchThisMonthGivers();
        }, interval);
    }

    googleCharts(title: string, footer: string, value: string){
        //cdn
        this.scriptURL = "https://www.gstatic.com/charts/loader.js";
        var scriptElement = document.createElement('script');


        //activate the donutcard
        this.donutCard = true;
        //make donutchart from the lastsundayvalue
        this.donutCardValue = value;
        this.donutcardFooter = footer;
        this.donutcardTitle = title;

            scriptElement.src = this.scriptURL;
        scriptElement.onload = () => {
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

    fetchThisMonthGivers(){
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

        this.apiService.getData("OrgAdminView/Users/?"+params)
            .then(resp =>
            {
                this.thisMonthGiversCard.value = resp;
                this.translate.get("Text_Givers").subscribe(value => { this.thisMonthGiversCard.title = value;});
                let datePipe = new DatePipe();
                this.thisMonthGiversCard.subtitle = datePipe.transform(date, 'MMMM yyyy');
                this.translate.get("Text_GiversLowercase").subscribe(value => { this.thisMonthGiversCard.footer = value;});
                let cardIsInCards = false;
                for(let i in this.cards){
                    if(this.cards[i].title === this.thisMonthGiversCard.title){
                        cardIsInCards = true;
                    }
                }
                if(!cardIsInCards){
                    this.cards.push(this.thisMonthGiversCard);
                }
            });
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
                this.translate.get("Text_ThisMonth").subscribe(value => { this.thisMonthCard.title = value;});
                this.translate.get("Text_Given").subscribe(value => { this.thisMonthCard.footer = value;});
                let datePipe = new DatePipe();
                this.thisMonthCard.subtitle = datePipe.transform(date, 'MMMM yyyy');
                let cardIsInCards = false;
                for(let i in this.cards){
                    if(this.cards[i].title === this.thisMonthCard.title){
                        cardIsInCards = true;
                    }
                }
                if(!cardIsInCards){
                    this.cards.push(this.thisMonthCard);
                }
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
                this.translate.get("Text_LastSunday").subscribe(value => { this.lastSundayCard.title = value;});
                this.translate.get("Text_Given").subscribe(value => { this.lastSundayCard.footer = value;});
                let datePipe = new DatePipe();
                this.lastSundayCard.subtitle = datePipe.transform(lastSunday.getUTCMonth()+1 + "/" + lastSunday.getUTCDate() + "/" + lastSunday.getUTCFullYear(), 'dd MMMM yyyy');
                this.googleCharts(this.lastSundayCard.subtitle, this.lastSundayCard.footer, this.lastSundayCard.value);
                this.cards.push(this.lastSundayCard);
            });
    }
}
