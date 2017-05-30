 import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/forkJoin';
import { Card } from '../models/card';
import { ApiClientService } from "app/services/api-client.service";
import {TranslateService} from "ng2-translate";

 declare var google: any;
@Component({
    selector: 'my-dashboard',
    templateUrl: '../html/dashboard.component.html',
    styleUrls: ['../css/dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy{
    cards: Card[] = [];
    lastSundayCard: Card = new Card();
    thisMonthCard: Card = new Card();
    thisMonthGiversCard: Card = new Card();
    isSafari: boolean;
    scriptURL: string;
    translate: TranslateService;

    ShowLoadingAnimation = false;

    euro = !navigator.language.includes('en') ? "€ " : "€";
    //maybe a new donutcard model?
    donutCard: boolean = false;
    donutcardValue: string;
    donutcardTitle: string;
    donutcardFooter: string;

    continuousData: any;

    constructor(private apiService: ApiClientService,  translate:TranslateService, private datePipe: DatePipe){
        this.translate = translate;
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        this.ShowLoadingAnimation = true;

    }

    ngOnDestroy(): void{
        clearInterval(this.continuousData);
    }

    ngOnInit() : void{
        Promise.all(
            [this.waitALittle(2000),this.fetchLastSundayGivts(),this.fetchThisMonthGivts(),this.fetchThisMonthGivers()]
        ).then(()=>{
            this.ShowLoadingAnimation = false;
            this.fetchDataContinuously(3000);
        })
    }

    waitALittle(ms: number){
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }

    fetchDataContinuously(interval: number){
        this.continuousData = setInterval(() => {
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
        this.donutcardValue = value;
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
                var container = <HTMLDivElement>document.getElementById("donutchart").firstChild.firstChild;
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
        let params = "DateBegin=" + dateBegin + "&DateEnd=" + dateEnd;

        return this.apiService.getData("OrgAdminView/Users/?"+params)
            .then(resp =>
            {
                this.thisMonthGiversCard.value = "<span class='fat-emphasis'>" + resp + "</span>";
                this.translate.get("Text_Givers").subscribe(value => { this.thisMonthGiversCard.title = value;});
                this.thisMonthGiversCard.subtitle = this.datePipe.transform(date, 'MMMM yyyy');
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
        let params = "DateBegin=" + dateBegin + "&DateEnd=" + dateEnd;

        return this.apiService.getData("OrgAdminView/Givts/?"+params)
            .then(resp =>
            {
                let collectSum = resp.TotalAmount;
                this.thisMonthCard.value = this.euro + "<span class='fat-emphasis'>" + (this.isSafari ? collectSum.toFixed(2) : collectSum.toLocaleString(navigator.language,{minimumFractionDigits: 2})) + "</span>";
                this.translate.get("Text_ThisMonth").subscribe(value => { this.thisMonthCard.title = value;});
                this.translate.get("Text_Given").subscribe(value => { this.thisMonthCard.footer = value;});
                this.thisMonthCard.subtitle = this.datePipe.transform(date, 'dd MMMM yyyy');
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
        let lastSunday = new Date(date.valueOf() - day*1000*60*60*24);
        let lastSundayDate = lastSunday.getUTCMonth()+1 + "-" + lastSunday.getUTCDate() + "-" + lastSunday.getUTCFullYear();
        let dateBegin =  lastSundayDate + " 00:00:00";
        let dateEnd = lastSundayDate + " 23:59:59";

        return this.apiService.getData("OrgAdminView/Givts/?DateBegin="+dateBegin+"&DateEnd="+dateEnd)
            .then(resp =>
            {
                let collectSum = resp.TotalAmount;
                this.lastSundayCard.value = this.euro+ "<span class='fat-emphasis'>" + (this.isSafari ? collectSum.toFixed(2) : collectSum.toLocaleString(navigator.language,{minimumFractionDigits: 2})) + "</span>";
                this.translate.get("Text_LastSunday").subscribe(value => { this.lastSundayCard.title = value;});
                this.translate.get("Text_Given").subscribe(value => { this.lastSundayCard.footer = value;});
                this.lastSundayCard.subtitle = this.datePipe.transform(lastSunday.getUTCMonth()+1 + "/" + lastSunday.getUTCDate() + "/" + lastSunday.getUTCFullYear(), 'yyyy-MM-dd');
                this.googleCharts(this.lastSundayCard.subtitle, this.lastSundayCard.footer, this.euro + (this.isSafari ? collectSum.toFixed(2) : collectSum.toLocaleString(navigator.language,{minimumFractionDigits: 2})));
                this.cards.push(this.lastSundayCard);
            });
    }
}
