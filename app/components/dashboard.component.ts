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
    isSafari: boolean;

    constructor(private apiService: ApiClientService){
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }

    ngOnInit() : void{
        //collect sum of last sunday
        //still have to collect the date of the last sunday
        //cards will come ...

        //last sunday card
        this.fetchLastSundayGivts();
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
                this.lastSundayCard.value = "€ " + (this.isSafari ? collectSum.toFixed(2) : collectSum.toLocaleString(navigator.language,{minimumFractionDigits: 2}));/*this.isSafari ? this.dayAmount.toFixed(2) : this.dayAmount.toLocaleString(navigator.language,{minimumFractionDigits: 2});*/
                this.lastSundayCard.title = "last sunday";
                let datePipe = new DatePipe();
                this.lastSundayCard.subtitle = datePipe.transform(lastSundayDate, 'dd MMMM yyyy');
                //this.lastSundayCard.subtitle = lastSundayDate;
                this.lastSundayCard.footer = "given";

                this.cards.push(this.lastSundayCard);
            });
    }
}
