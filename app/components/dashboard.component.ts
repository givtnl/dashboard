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

    constructor(private apiService: ApiClientService){
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }

    ngOnInit() : void{
        this.fetchLastSundayGivts();
        this.fetchThisMonthGivts();
    }

    fetchThisMonthGivts(){
        let date = new Date();
        let month = date.getUTCMonth()+1;
        let nextMonth = month == 12 ? 1 : month +1;
        let year = date.getFullYear();
        let dateBegin = month + "-01-" + year;
        let dateEnd = nextMonth + "-01-" + year;
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
