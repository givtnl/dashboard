import { Component,OnInit,isDevMode } from '@angular/core';
import { DatePipe } from '@angular/common';

import { ApiClientService } from "app/services/api-client.service";
import {Payout} from "../models/payout";
import {TranslateService} from "ng2-translate";
import {ViewEncapsulation} from '@angular/core';
import {DataService} from "../services/data.service";


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

    constructor(private apiService: ApiClientService,private dataService: DataService, translate: TranslateService, private datePipe: DatePipe) {
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
      let start = this.datePipe.transform(this.dateBegin, "y-MM-dd");
      let end = this.datePipe.transform(this.dateEnd, "y-MM-dd");

      let apiUrl = 'Payments/CSV?dtBegin=' + start + '&dtEnd=' + end;
      this.apiService.getData(apiUrl)
        .then(resp =>
        {
          var csvContent = "data:text/csv;charset=utf-8,";
          csvContent += resp;

          var encodedUri = encodeURI(csvContent);
          var link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          let beginDate = this.datePipe.transform(new Date(this.dateBegin), "dd-MM-y");
          let endDate = this.datePipe.transform(new Date(this.dateEnd), "dd-MM-y");
          let orgName = "";

          if(this.dataService.getData("currentCollectGroup") != undefined) {
            orgName = JSON.parse(this.dataService.getData("currentCollectGroup")).Name;
          }

          let fileName = orgName + " - " + beginDate + " - " + endDate + ".csv";
          link.setAttribute("download", fileName);
          document.body.appendChild(link); // Required for FF

          link.click(); // This will download the data file named "my_data.csv".
        });
    }


}
