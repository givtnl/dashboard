///<reference path="../models/payout.ts"/>
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
                console.log(this.payouts);
                for(let i in this.payouts){
                    let x = this.payouts[i];
                    x.BeginDate = datepipe.transform(this.payouts[i].BeginDate, "d MMMM y");
                    x.EndDate = datepipe.transform(this.payouts[i].EndDate, "d MMMM y");

                    x.Mandaatkosten = x.MandateCostCount * this.mandateCost;
                    x.Transactiekosten = x.TransactionCount * this.transactionCost;
                    x.Uitbetalingskosten = 0.18;
                    x.T_Total_Excl = x.Mandaatkosten + x.Transactiekosten + x.Uitbetalingskosten;
                    x.T_BTW = x.MandateTaxes + x.TransactionTaxes + x.PayoutCostTaxes;
                    x.T_Total_Incl = x.T_Total_Excl + x.T_BTW;

                    x.SK_Total_Incl = x.RTransactionT1Cost + x.RTransactionT2Cost + x.RTransactionTaxes;
                    x.G_Total_Incl = x.GivtServiceFee + x.GivtServiceFeeTaxes;

                    //tr fee + storno fee + givt fee + storno bedragen
                    x.TotaalInhoudingen = x.T_Total_Incl + x.SK_Total_Incl + x.G_Total_Incl + x.RTransactionAmount;

                    x.ToegezegdBedrag = x.TotaalInhoudingen + x.TotalPaid;

                    x.Mandaatkosten = this.displayValue(x.Mandaatkosten);
                    x.Transactiekosten = this.displayValue(x.Transactiekosten);
                    x.Uitbetalingskosten = this.displayValue(x.Uitbetalingskosten);
                    x.T_Total_Excl = this.displayValue(x.T_Total_Excl);
                    x.T_BTW = this.displayValue(x.T_BTW);
                    x.T_Total_Incl = this.displayValue(x.T_Total_Incl);

                    x.StorneringsKostenT1 = this.displayValue(x.RTransactionT1Cost);
                    x.StorneringsKostenT2 = this.displayValue(x.RTransactionT2Cost);
                    x.SK_Total_Excl = this.displayValue(x.RTransactionT1Cost + x.RTransactionT2Cost);
                    x.SK_BTW = this.displayValue(x.RTransactionTaxes);
                    x.SK_Total_Incl = this.displayValue(x.SK_Total_Incl);

                    x.G_Total_Excl = this.displayValue(x.GivtServiceFee);
                    x.G_BTW = this.displayValue(x.GivtServiceFeeTaxes);
                    x.G_Total_Incl = this.displayValue(x.G_Total_Incl);

                    x.GestorneerdeBedragen = this.displayValue(x.RTransactionAmount);
                    x.TotaalInhoudingen = this.displayValue(x.TotaalInhoudingen);
                    x.ToegezegdBedrag = this.displayValue(x.ToegezegdBedrag);


                    x.hidden = true;
                    x.TotalPaidText = this.displayValue(x.TotalPaid);

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

                    x.activeRow = 1;
                }
            });
    }

    displayValue(x)
    {
        console.log(x);
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
