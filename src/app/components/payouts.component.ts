import { Component,OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { ApiClientService } from "app/services/api-client.service";
import {Payout} from "../models/payout";
@Component({
    selector: 'my-collects',
    templateUrl: '../html/payouts.component.html',
    styleUrls: ['../css/payouts.component.css']
})

export class PayoutsComponent implements OnInit{

    payouts : Payout[] = [];

    constructor(private apiService: ApiClientService) {
    }

    ngOnInit(){
        let datepipe = new DatePipe();
        this.apiService.getData("OrgAdminView/Payouts")
            .then(resp =>
            {
                this.payouts = resp;
                for(let i in this.payouts){
                    this.payouts[i].BeginDate = datepipe.transform(this.payouts[i].BeginDate, "d MMMM y");
                    this.payouts[i].EndDate = datepipe.transform(this.payouts[i].EndDate, "d MMMM y");
                    this.payouts[i].hidden = false;
                }
            });
    }

    openDetail(x){
        console.log(x);
    }
}
