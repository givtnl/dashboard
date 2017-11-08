import { Component,OnInit,isDevMode } from '@angular/core';
import { DatePipe } from '@angular/common';

import { ApiClientService } from "app/services/api-client.service";
import {Payout} from "../models/payout";
import {TranslateService} from "ng2-translate";
import {ViewEncapsulation} from '@angular/core';


@Component({
    selector: 'my-collects',
    templateUrl: '../html/payouts.component.html',
    styleUrls: ['../css/payouts.component.css'],
    encapsulation: ViewEncapsulation.None
})

export class PayoutsComponent implements OnInit{

    openAllocations: boolean = false;
    payouts : Payout[] = [];
    isSafari: boolean;

    transactionCost = 0.08;
    mandateCost = 0.125;
    R1Cost = 0.18;
    R2Cost = 1.20;
    translate: TranslateService;

    dateBegin: Date = null;
    dateEnd: Date = null;

    constructor(private apiService: ApiClientService,translate: TranslateService, private datePipe: DatePipe) {
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        this.translate = translate;

        this.dateBegin = new Date();
        this.dateEnd = new Date();
        this.dateBegin.setDate(this.dateBegin.getDate() - 7)

    }

  checkAllocations(){
    let apiUrl = 'Allocations/AllocationCheck';
    this.apiService.getData(apiUrl)
      .then(resp => {
        if(resp.length > 0){
          this.openAllocations = true;
        }
      });
  }

    ngOnInit(){
      this.checkAllocations();
      //this.payouts = require("../models/payout").testData;

      this.apiService.getData("Payments/Payouts")
          .then(resp =>
          {
            this.payouts = resp;
          });
    }

    displayValue(x)
    {
        let euro =  "€";
        if(!navigator.language.includes('en'))
            euro += " ";
        return euro + (this.isSafari ? (x).toFixed(2) : (x).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}));
    }

    exportCSV() {
      let start = this.dateBegin.toISOString();
      let end = this.dateEnd.toISOString();
      let apiUrl = 'Payments/CSV?dtBegin=' + start + '&dtEnd=' + end;
      this.apiService.getData(apiUrl)
        .then(resp =>
        {
          //TODO: when maarten is ready, parse this response to CSV file!
          console.log(resp)
        });
    }


}
