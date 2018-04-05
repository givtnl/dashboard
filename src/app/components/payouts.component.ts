import { Component,OnInit,isDevMode } from '@angular/core';
import { DatePipe } from '@angular/common';

import { ApiClientService } from "app/services/api-client.service";
import {Payout} from "../models/payout";
import {TranslateService} from "ng2-translate";
import {ViewEncapsulation} from '@angular/core';
import {DataService} from "../services/data.service";
import {UserService} from "../services/user.service";


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
    loader: object = {show: false};
    constructor(private apiService: ApiClientService,private dataService: DataService, translate: TranslateService, private datePipe: DatePipe, private userService: UserService) {
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        this.translate = translate;

        this.dateBegin = new Date();
        this.dateEnd = new Date();
        this.dateBegin.setDate(this.dateBegin.getDate() - 7)

        this.userService.collectGroupChanged.subscribe(() => {
            this.ngOnInit();
        });

	    if (!!this.dataService.getData('payoutDateBegin') && !!this.dataService.getData('payoutDateEnd')) {
		    this.dateBegin = new Date(Number(this.dataService.getData('payoutDateBegin')) * 1000);
		    this.dateEnd = new Date(Number(this.dataService.getData('payoutDateEnd')) * 1000);
	    }
    }

  checkAllocations(){
    let apiUrl = 'Allocations/AllocationCheck';
    this.apiService.getData(apiUrl)
      .then(resp => {
      	console.log(resp);
        if(resp.filter((ts) => ts.AllocationName == null && ts.Fixed == null).length > 0){
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
          	this.payouts = [];
          	if(resp.length > 0) {
	            this.payouts = resp;
            }
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
      this.loader["show"] = true;
      let start = this.datePipe.transform(this.dateBegin, "y-MM-dd");
      let end = this.datePipe.transform(this.dateEnd, "y-MM-dd");

	   this.dataService.writeData("payoutDateBegin", Math.round(this.dateBegin.getTime() / 1000));
	   this.dataService.writeData("payoutDateEnd", Math.round(this.dateEnd.getTime() / 1000));

      let apiUrl = 'Payments/CSV?dtBegin=' + start + '&dtEnd=' + end;
      this.apiService.getData(apiUrl)
        .then(resp =>
        {
          this.loader["show"] = false;
          var csvContent = "data:text/csv;charset=utf-8,";
          csvContent += resp;

          var encodedUri = encodeURI(csvContent);
          var link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          let beginDate = this.datePipe.transform(new Date(this.dateBegin), "dd-MM-y");
          let endDate = this.datePipe.transform(new Date(this.dateEnd), "dd-MM-y");

          let fileName = this.userService.CurrentCollectGroup.Name + " - " + beginDate + " - " + endDate + ".csv";
          link.setAttribute("download", fileName);
          document.body.appendChild(link); // Required for FF

          link.click(); // This will download the data file named "my_data.csv".
        });
    }


}
