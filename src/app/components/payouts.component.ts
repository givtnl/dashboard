import { Component,OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { ApiClientService } from "app/services/api-client.service";
import {Payout} from "../models/payout";
import {TranslateService} from "ng2-translate";
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
    R1Cost = 0.18;
    R2Cost = 1.20;
    translate: TranslateService;


    constructor(private apiService: ApiClientService,translate: TranslateService) {
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        this.translate = translate;

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
                    x.TotalPaidText = this.displayValue(x.TotalPaid);
                    x.TransactionCost =  this.displayValue(x.TransactionCount * this.transactionCost);
                    x.MandateCost =  this.displayValue(x.MandateCostCount * this.mandateCost);
                    x.TotalTransactionCost = this.displayValue(x.TransactionCount * this.transactionCost + x.MandateCostCount * this.mandateCost);

                    x.StornoT1 = this.displayValue(x.RTransactionT1Count * this.R1Cost + x.RTransactionT1Amount);
                    x.StornoT2 = this.displayValue(x.RTransactionT2Count * this.R2Cost + x.RTransactionT2Amount);
                    x.TotalStorno = this.displayValue(( (x.RTransactionT1Count * this.R1Cost) + x.RTransactionT1Amount) + ((x.RTransactionT2Count * this.R2Cost) + x.RTransactionT2Amount));

                    x.TotalGivtFee = this.displayValue(x.GivtServiceFee);

                    x.PayoutCost = this.displayValue(0.18);

                    this.translate.get('Text_Info_Mandate', {0: x.MandateCostCount,1: (this.isSafari ? (this.mandateCost).toFixed(3) : (this.mandateCost).toLocaleString(navigator.language,{minimumFractionDigits: 3,maximumFractionDigits:3}))}).subscribe((res: string) => {
                        x.Text_Info_Mandate = res;
                    });

                    this.translate.get('Text_Info_Transaction', {0: x.TransactionCount,1: (this.isSafari ? (this.transactionCost).toFixed(2) : (this.transactionCost).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}))}).subscribe((res: string) => {
                        x.Text_Info_Transaction = res;
                    });

                    this.translate.get('Text_Info_Type1', {0: x.RTransactionT1Count,1: (this.isSafari ? (0.18).toFixed(2) : (0.18).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}))}).subscribe((res: string) => {
                        x.Text_Info_Type1 = res;
                    });

                    this.translate.get('Text_Info_Type2', {0: x.RTransactionT2Count,1: (this.isSafari ? (1.20).toFixed(2) : (1.20).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}))}).subscribe((res: string) => {
                        x.Text_Info_Type2 = res;
                    });

                    this.translate.get('Text_Info_Total_Stornos', {0: (this.isSafari ? (x.RTransactionT2Amount).toFixed(2) : (x.RTransactionT2Amount).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}))}).subscribe((res: string) => {
                        x.Total_Stornation2 = res;
                    });
                    this.translate.get('Text_Info_Total_Stornos', {0: (this.isSafari ? (x.RTransactionT1Amount).toFixed(2) : (x.RTransactionT1Amount).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}))}).subscribe((res: string) => {
                        x.Total_Stornation = res;
                    });

                    x._storno = ((x.RTransactionT1Count * this.R1Cost) + x.RTransactionT1Amount) + ((x.RTransactionT2Count * this.R2Cost) + x.RTransactionT2Amount);
                    x._transaction = x.TransactionCount * this.transactionCost + x.MandateCostCount * this.mandateCost;
                    x.WithholdAmount = this.displayValue(x._storno + x._transaction + x.GivtServiceFee);

                    x.Admitted = this.displayValue((x._storno + x._transaction + x.GivtServiceFee) + x.TotalPaid);

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
