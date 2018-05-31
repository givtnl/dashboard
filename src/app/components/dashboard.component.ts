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
    isSafari: boolean;
    translate: TranslateService;

    ShowLoadingAnimation = false;

    euro = !navigator.language.includes('en') ? "€ " : "€";

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
            this.fetchThisMonthGivts();
            this.fetchThisMonthGivers();
            this.fetchLastDayGivts();
            if (this.ShowLoadingAnimation)
                this.ShowLoadingAnimation = false;
        }, 3000);
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

        let dateBegin = new Date(sprintf("%4i-%02i-01T00:00:00.000%s", year, month, this.datePipe.getLocalTimeZoneISOString()));
        let dateEnd = new Date(sprintf("%4i-%02i-01T00:00:00.000%s", secondYear, nextMonth, this.datePipe.getLocalTimeZoneISOString()));
        let params = "DateBegin=" + this.datePipe.toISODateUTC(new Date(dateBegin)) + "&DateEnd=" + this.datePipe.toISODateUTC(new Date(dateEnd));

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

        let dateBegin = new Date(sprintf("%4i-%02i-01T00:00:00.000%s", year, month, this.datePipe.getLocalTimeZoneISOString()));
        let dateEnd = new Date(sprintf("%4i-%02i-01T00:00:00.000%s", secondYear, nextMonth, this.datePipe.getLocalTimeZoneISOString()));
        let params = "DateBegin=" + this.datePipe.toISODateUTC(new Date(dateBegin)) + "&DateEnd=" + this.datePipe.toISODateUTC(new Date(dateEnd));

        return this.apiService.getData("Cards/Givts/?"+params)
            .then(resp =>
            {
                if(resp){
                    let collectSum = resp.TotalAmount;
                    let average = collectSum / resp.TransactionCount;
                    this.thisMonthCard.value = this.euro + "<span class='fat-emphasis'>" + (this.isSafari ? collectSum.toFixed(2) : collectSum.toLocaleString(navigator.language,{minimumFractionDigits: 2})) + "</span>";
                    this.translate.get("Text_ThisMonth").subscribe(value => { this.thisMonthCard.title = value;});
                    this.translate.get("Text_Given").subscribe(value => { this.thisMonthCard.footer = value;});
                    this.thisMonthCard.subtitle = this.datePipe.transform(date, 'MMMM yyyy');
                    this.translate.get("AverageCard").subscribe(value => { this.thisMonthCard.average = value + " " + this.euro + " " + average.toFixed(2).toString(); });
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

    fetchLastDayGivts(){
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
                this.lastSundayCard.value = this.euro+ "<span class='fat-emphasis'>" + (this.isSafari ? collectSum.toFixed(2) : collectSum.toLocaleString(navigator.language,{minimumFractionDigits: 2})) + "</span>";
                this.translate.get(this.daysOfWeek[displayDate.getDay()]).subscribe(value => { this.lastSundayCard.title = value;});
                this.translate.get("Text_Given").subscribe(value => { this.lastSundayCard.footer = value;});
                this.lastSundayCard.subtitle = this.datePipe.transform(displayDate, 'dd-MM-yyyy');
                this.translate.get("AverageCard").subscribe(value => { this.lastSundayCard.average = value + " " + this.euro + " " + average.toFixed(2).toString(); });
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
