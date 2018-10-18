import { Component, OnInit, OnDestroy } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/observable/forkJoin';
import { Card } from '../models/card';
import { ApiClientService } from "app/services/api-client.service";
import {TranslateService} from "ng2-translate";
import {UserService} from "../services/user.service";
import {ISODatePipe} from "../pipes/iso.datepipe";
import {sprintf} from 'sprintf-js';

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
    averageGiversCard: Card = new Card();
    isSafari: boolean;
    translate: TranslateService;

    ShowLoadingAnimation = false;

    currencySymbol = this.userService.currencySymbol;

    continuousData: any;

    lastSundaySum: number;

    constructor(private apiService: ApiClientService,  translate:TranslateService, private datePipe: ISODatePipe, private userService: UserService){
      this.translate = translate;
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        this.ShowLoadingAnimation = true;

        this.userService.collectGroupChanged.subscribe(() => {
            this.ShowLoadingAnimation = true;
            this.ngOnInit();
        });
    }

    ngOnDestroy(): void{
        clearInterval(this.continuousData);
    }

    ngOnInit() : void{
        this.continuousData = setInterval(() => {
            let f1 = this.fetchThisMonthGivts();
            let f2 = this.fetchThisMonthGivers();
            let f3 = this.fetchLastDayGivts();
            let f4 = this.fetchAverageGivers();
            Promise.all([f1, f2, f3, f4]).then(() => {
                if (this.ShowLoadingAnimation)
                    this.ShowLoadingAnimation = false;
            });
        }, 3000);

    }

    fetchThisMonthGivers() : Promise<void> {
        let date = new Date();
        let month = date.getUTCMonth()+1;
        let year = date.getFullYear();
        let secondYear = date.getFullYear();
        let nextMonth = month + 1;
        if(month == 12){
            secondYear = date.getFullYear()+1;
            nextMonth = 1;
        }

        let dateBegin = new Date(sprintf("%4i-%02i-01T00:00:00.000%s", year, month, this.datePipe.getLocalTimeZoneISOString()));
        let dateEnd = new Date(sprintf("%4i-%02i-01T00:00:00.000%s", secondYear, nextMonth, this.datePipe.getLocalTimeZoneISOString()));
        let params = "DateBegin=" + this.datePipe.toISODateUTC(new Date(dateBegin)) + "&DateEnd=" + this.datePipe.toISODateUTC(new Date(dateEnd));

        return this.apiService.getData("Cards/Users/?"+params)
            .then(resp =>
            {
                this.thisMonthGiversCard.value = "<span class='fat-emphasis'>" + resp + "</span>";
                this.translate.get("Text_Givers").subscribe(value => { this.thisMonthGiversCard.title = value;});
                this.thisMonthGiversCard.subtitle = new Date().toLocaleDateString(navigator.language, { year: 'numeric', month: 'long'});
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

    fetchAverageGivers() : Promise<void> {
      return this.apiService.getData("v2/collectgroups/"+this.userService.CurrentCollectGroup.GUID+"/cards/user-average")
        .then(resp =>
        {
          this.averageGiversCard.value = "<span class='fat-emphasis'>" + resp + "</span>";
          //this.averageGiversCard.subtitle = new Date().toLocaleDateString(navigator.language, { year: 'numeric', month: 'long'});
          this.translate.get("Card_AverageGivers").subscribe(value => { this.averageGiversCard.title = value;});
          this.translate.get("Card_Weekly").subscribe(value => { this.averageGiversCard.footer = value;});
          let cardIsInCards = false;
          for(let i in this.cards){
            if(this.cards[i].title === this.averageGiversCard.title){
              cardIsInCards = true;
            }
          }
          if(!cardIsInCards){
            this.cards.push(this.averageGiversCard);
          }
        });
    }

    fetchThisMonthGivts() : Promise<void> {
        let date = new Date();
        let month = date.getUTCMonth()+1;
        let year = date.getFullYear();
        let secondYear = date.getFullYear();
        let nextMonth = month + 1;
        if(month == 12){
            secondYear = date.getFullYear()+1;
            nextMonth = 1;
        }

        let dateBegin = new Date(sprintf("%4i-%02i-01T00:00:00.000%s", year, month, this.datePipe.getLocalTimeZoneISOString()));
        let dateEnd = new Date(sprintf("%4i-%02i-01T00:00:00.000%s", secondYear, nextMonth, this.datePipe.getLocalTimeZoneISOString()));
        let params = "DateBegin=" + this.datePipe.toISODateUTC(new Date(dateBegin)) + "&DateEnd=" + this.datePipe.toISODateUTC(new Date(dateEnd));




      return this.apiService.getData("Cards/Givts/?"+params)
            .then(resp =>
            {
                if(resp){
                    let collectSum = resp.TotalAmount;
                    let average = 0;
                    if(collectSum != 0){
                        average = collectSum / resp.TransactionCount;
                    }
                    this.thisMonthCard.value = this.currencySymbol + "<span class='fat-emphasis'>" + (this.isSafari ? collectSum.toFixed(2) : collectSum.toLocaleString(navigator.language,{minimumFractionDigits: 2})) + "</span>";
                    this.translate.get("Text_ThisMonth").subscribe(value => { this.thisMonthCard.title = value;});
                  var donation = "";
                  this.translate.get("Text_Donation").subscribe(value => { donation = value; });
                    this.translate.get("Text_Given").subscribe(value => { this.thisMonthCard.footer = value + " per " + donation;});
                    this.thisMonthCard.subtitle = new Date().toLocaleDateString(navigator.language, { year: 'numeric', month: 'long'});
                    this.translate.get("Card_Average").subscribe(value => { this.thisMonthCard.average = value + " " + this.currencySymbol + " " + average.toLocaleString(navigator.language,{minimumFractionDigits: 2, maximumFractionDigits: 2}) });
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

    fetchLastDayGivts() : Promise<void> {
        let dtEnd = this.datePipe.transform(new Date(), "yyyy-MM-ddT23:59:59.999" + this.datePipe.getLocalTimeZoneISOString());
        let dtBegin = this.datePipe.transform(new Date().setDate(new Date().getDate() - 6), "yyyy-MM-ddT00:00:00.000" + this.datePipe.getLocalTimeZoneISOString());
        let dateEnd = new Date(dtEnd);
        let dateBegin = new Date(dtBegin);

        return this.apiService.getData("v2/collectgroups/" + this.userService.CurrentCollectGroup.GUID
                                        + "/givts/view/search?dtBegin="+ this.datePipe.toISODateUTC(dateBegin) + "&dtEnd=" + this.datePipe.toISODateUTC(dateEnd))
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
                let average = 0;
                if(collectSum != 0){
                    average = collectSum / highest.Count;
                }
                this.lastSundaySum = collectSum;
                this.lastSundayCard.value = this.currencySymbol+ "<span class='fat-emphasis'>" + (this.isSafari ? collectSum.toFixed(2) : collectSum.toLocaleString(navigator.language,{minimumFractionDigits: 2})) + "</span>";
                var donation = "";
                this.translate.get("Text_Donation").subscribe(value => { donation = value; });
                this.translate.get("Text_Given").subscribe(value => { this.lastSundayCard.footer = value + " per " + donation });
                this.translate.get(["LastCollectDay",this.daysOfWeek[displayDate.getDay()]]).subscribe(val => {
	                this.lastSundayCard.title = val["LastCollectDay"];
	                this.lastSundayCard.subtitle = val[this.daysOfWeek[displayDate.getDay()]] + " " + displayDate.toLocaleDateString(navigator.language, { day:'numeric', year: 'numeric', month: 'long'});
                });
                this.translate.get("Card_Average").subscribe(value => { this.lastSundayCard.average = value + " " + this.currencySymbol + " " + average.toLocaleString(navigator.language,{minimumFractionDigits: 2, maximumFractionDigits: 2}); });
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
