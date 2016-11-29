import {Component, OnInit} from '@angular/core';

import { Card } from '../models/card';
import {ApiClientService} from "../services/api-client.service";

@Component({
    selector: 'my-dashboard',
    templateUrl: 'app/html/dashboard.component.html'
    styleUrls: ['./app/css/dashboard.component.css']
})
export class DashboardComponent implements OnInit{
    cards: Card[] = [];
    lastSundayCard: Card = new Card();

    constructor(private apiService: ApiClientService){

    }

    ngOnInit() : void{
        //collect sum of last sunday
        //still have to collect the date of the last sunday
        //cards will come ...
        this.apiService.getData("OrgAdminView/Givts/?DateBegin=11-28-2016")
            .then(resp =>
            {
                let collectSum = 0;
                for(let givt in resp){
                    collectSum = collectSum + resp[givt].Amount;
                }
                this.lastSundayCard.value = collectSum.toString();
                this.lastSundayCard.title = "last sunday";
                this.lastSundayCard.footer = "given";
                this.lastSundayCard.subtitle = "hoi";

                this.cards.push(this.lastSundayCard);
            });
    }
}
