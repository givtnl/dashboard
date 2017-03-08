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
    isSafari: boolean;

    transactionCost = 0.08;
    mandateCost = 0.125;


    constructor(private apiService: ApiClientService) {
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    }

    ngOnInit(){
        let datepipe = new DatePipe();
        this.apiService.getData("OrgAdminView/Payouts")
            .then(resp =>
            {
                this.payouts = resp;
                for(let i in this.payouts){
                    let x = this.payouts[i];
                    x.BeginDate = datepipe.transform(this.payouts[i].BeginDate, "d MMMM y");
                    x.EndDate = datepipe.transform(this.payouts[i].EndDate, "d MMMM y");
                    x.hidden = true;

                    x.TransactionCost =  this.displayValue(x.TransactionCount * this.transactionCost);
                    x.MandateCost =  this.displayValue(x.MandateCostCount * this.mandateCost);
                    x.TotalTransactionCost = this.displayValue(x.TransactionCount * this.transactionCost + x.MandateCostCount * this.mandateCost);
                    x.activeRow = 1;
                }
            });
    }

    displayValue(x)
    {
        return "€ " + (this.isSafari ? (x).toFixed(2) : (x).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}));
    }

    openPayout(x){
        for(let i in this.payouts)
        {
            this.payouts[i].hidden = true;
        }
        x.hidden = !x.hidden;
        console.log(x);
    }

    closePayout(x){
        x.hidden = !x.hidden;
    }

    selectRow(x, y)
    {
        x.activeRow = y;
    }
}
