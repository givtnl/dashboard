import { Component, OnInit, OnDestroy } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/forkJoin';
import { Card } from '../models/card';
import { ApiClientService } from "app/services/api-client.service";
import {TranslateService} from "ng2-translate";
import {DataService} from "../services/data.service";
import {UserService} from "../services/user.service";
import {ISODatePipe} from "../pipes/iso.datepipe";

 declare var google: any;
@Component({
    selector: 'my-dashboard',
    templateUrl: '../html/dashboard.component.html',
    styleUrls: ['../css/dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy{

    daysOfWeek : string[] = [
        "Text_LastSunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    cards: Card[] = [];
    lastSundayCard: Card = new Card();
    thisMonthCard: Card = new Card();
    thisMonthGiversCard: Card = new Card();
    isSafari: boolean;
    translate: TranslateService;

    ShowLoadingAnimation = false;

    euro = !navigator.language.includes('en') ? "€ " : "€";
    //maybe a new donutcard model?
    donutCard: boolean = false;
    donutcardValue: string;
    donutcardTitle: string;
    donutcardFooter: string;

    continuousData: any;

    lastSundaySum: number;

    constructor(private apiService: ApiClientService,  translate:TranslateService, private datePipe: ISODatePipe, private dataService: DataService, private userService: UserService){
      this.translate = translate;
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        this.ShowLoadingAnimation = true;

        this.userService.collectGroupChanged.subscribe(() => {
            this.ngOnInit();
        });
    }

    ngOnDestroy(): void{
        clearInterval(this.continuousData);
    }

    ngOnInit() : void{
      google.charts.load('current', {'packages':['corechart']});

        Promise.all(
            [this.waitALittle(2000),this.fetchLastSundayGivts(),this.fetchThisMonthGivts(),this.fetchThisMonthGivers()]
        ).then(()=>{
            google.charts.setOnLoadCallback(() => this.drawChart());
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
        //activate the donutcard
        this.donutCard = true;
        //make donutchart from the lastsundayvalue
        this.donutcardValue = value;
        this.donutcardFooter = footer;
        this.donutcardTitle = title;

    }

    drawChart() {
      let dataTable = new google.visualization.DataTable();
      dataTable.addColumn('string', 'Bedrag');
      dataTable.addColumn('number', 'Euro');
      // A column for custom tooltip content
      dataTable.addColumn({type: 'string', role: 'tooltip'});
      dataTable.addRows([
        ['', 90,'€ 456 goedgekeurd!']
      ]);
      let options = {
        pieSliceBorderColor: 'transparent',
        width: 280,
        height: 280,
        chartArea: {'width': '100%', 'height': '80%'},
        colors: ['#42C98E','#D43D4C','#4F98CF'],
        legend: {position: 'none'},
        pieHole: 0.85,
        pieSliceText: 'label',
        pieStartAngle: 0,
        pieSliceTextStyle:{color: 'black', fontName: 'arial', fontSize: 10},
        backgroundColor: 'transparent'
      };

      let div = document.getElementById('donutchart');
      if(div)
      {
        let chart = new google.visualization.PieChart(document.getElementById('donutchart'));
        chart.draw(dataTable, options);
        let container = <HTMLDivElement>div.firstChild.firstChild;
        if(container)
          container.style.width = "100%";
      }
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

        let dateBegin = year + "-" + month + "-01 00:00:00";
        let dateEnd = secondYear + "-" + nextMonth + "-01 00:00:00";
        let params = "DateBegin=" + this.datePipe.toISODateNoLocale(new Date(dateBegin)) + "&DateEnd=" + this.datePipe.toISODateNoLocale(new Date(dateEnd));

        return this.apiService.getData("Cards/Users/?"+params)
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

        let dateBegin = year + "-" + month + "-01 00:00:00";
        let dateEnd = secondYear + "-" + nextMonth + "-01 00:00:00";
        let params = "DateBegin=" + this.datePipe.toISODateNoLocale(new Date(dateBegin)) + "&DateEnd=" + this.datePipe.toISODateNoLocale(new Date(dateEnd));

        return this.apiService.getData("Cards/Givts/?"+params)
            .then(resp =>
            {
                if(resp){
                    let collectSum = resp.TotalAmount;
                    this.thisMonthCard.value = this.euro + "<span class='fat-emphasis'>" + (this.isSafari ? collectSum.toFixed(2) : collectSum.toLocaleString(navigator.language,{minimumFractionDigits: 2})) + "</span>";
                    this.translate.get("Text_ThisMonth").subscribe(value => { this.thisMonthCard.title = value;});
                    this.translate.get("Text_Given").subscribe(value => { this.thisMonthCard.footer = value;});
                    this.thisMonthCard.subtitle = this.datePipe.transform(date, 'MMMM yyyy');
                    let cardIsInCards = false;
                    for(let i in this.cards){
                        if(this.cards[i].title === this.thisMonthCard.title){
                            cardIsInCards = true;
                        }
                    }
                    if(!cardIsInCards){
                        this.cards.push(this.thisMonthCard);
                    }
                }
            });
    }

    fetchLastSundayGivts(){
        let dateBegin;
        let dateEnd;
        dateEnd = new Date(this.datePipe.transform(new Date(), "yyyy-MM-dd 23:59:59"));
        dateBegin = new Date(this.datePipe.transform(new Date().setDate(dateEnd.getDate() - 6), "yyyy-MM-dd 00:00:00"));

        return this.apiService.getData("v2/collectgroups/" + this.userService.CurrentCollectGroup.GUID
                                        + "/givts/view/search?dtBegin="+ this.datePipe.toISODateNoLocale(dateBegin) + "&dtEnd=" + this.datePipe.toISODateNoLocale(dateEnd))
            .then(resp =>
            {
                if(resp.statusCode == 500)
                    return;

                let highest = resp.reduce(function(rv, x) {
                    if (rv && x.Count < rv.Count) return rv;
                    else return x;
                }, {Sum:0, Count:0, Date:new Date()});

                let displayDate = new Date(highest.Date);

                let collectSum = highest.Sum;
                this.lastSundaySum = collectSum;
                this.lastSundayCard.value = this.euro+ "<span class='fat-emphasis'>" + (this.isSafari ? collectSum.toFixed(2) : collectSum.toLocaleString(navigator.language,{minimumFractionDigits: 2})) + "</span>";
                this.translate.get(this.daysOfWeek[displayDate.getDay()]).subscribe(value => { this.lastSundayCard.title = value;});
                this.translate.get("Text_Given").subscribe(value => { this.lastSundayCard.footer = value;});
                this.lastSundayCard.subtitle = this.datePipe.transform(displayDate, 'dd-MM-yyyy');
                if(!<HTMLDivElement>document.getElementById("donutchart"))
                    this.googleCharts(this.lastSundayCard.subtitle, this.lastSundayCard.footer, this.euro + (this.isSafari ? collectSum.toFixed(2) : collectSum.toLocaleString(navigator.language,{minimumFractionDigits: 2})));
                let cardIsInCards = false;
                for(let i in this.cards){
                    if(this.cards[i].title === this.lastSundayCard.title){
                        cardIsInCards = true;
                    }
                }
                if(!cardIsInCards){
                    this.cards.push(this.lastSundayCard);
                }
            });
    }
}
