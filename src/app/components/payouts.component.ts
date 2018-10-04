import { Component, OnInit } from '@angular/core';

import { ApiClientService } from "app/services/api-client.service";
import { Payout } from "../models/payout";
import { TranslateService } from "ng2-translate";
import { ViewEncapsulation } from '@angular/core';
import { DataService } from "../services/data.service";
import { UserService } from "../services/user.service";
import { ISODatePipe } from "../pipes/iso.datepipe";


@Component({
    selector: 'my-collects',
    templateUrl: '../html/payouts.component.html',
    styleUrls: ['../css/payouts.component.css'],
    encapsulation: ViewEncapsulation.None
})

export class PayoutsComponent implements OnInit {

    openAllocations = false;
    payouts: Payout[] = [];
    isSafari: boolean;

    translate: TranslateService;

    dateBegin: Date = null;
    dateEnd: Date = null;
    loader: object = { show: false };
    openAllocationsMessage: string;
    dateFirstNonAllocation: string;

    unPaidHighGivt = false;

    constructor(private apiService: ApiClientService, private dataService: DataService, translate: TranslateService, private datePipe: ISODatePipe, private userService: UserService) {
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        this.translate = translate;

        this.dateBegin = new Date();
        this.dateEnd = new Date();
        this.dateBegin.setDate(this.dateBegin.getDate() - 7);

        this.userService.collectGroupChanged.subscribe(() => {
            this.ngOnInit();
        });

        if (!!this.dataService.getData('payoutDateBegin') && !!this.dataService.getData('payoutDateEnd')) {
            this.dateBegin = new Date(Number(this.dataService.getData('payoutDateBegin')) * 1000);
            this.dateEnd = new Date(Number(this.dataService.getData('payoutDateEnd')) * 1000);
        }
    }

    checkAllocations() {
        let apiUrl = 'v2/collectgroups/' +
            this.userService.CurrentCollectGroup.GUID +
            '/allocations/non-allocated/date-bounds';


        this.apiService.getData(apiUrl)
            .then(resp => {
                if (resp) {
                    if (resp.length === 2) {
                        this.openAllocations = true;
                        let dtBegin = new Date(resp[0].dt_Confirmed);
                        let dtEnd = new Date(resp[1].dt_Confirmed);
                        this.openAllocationsMessage = this.translate.instant("MultipleOpenAllocationsMessage");
                        this.openAllocationsMessage = this.openAllocationsMessage.replace("{0}", dtBegin.toLocaleDateString(navigator.language, {
                            day: 'numeric', month: 'numeric', year: 'numeric'
                        }));
                        this.openAllocationsMessage = this.openAllocationsMessage.replace("{1}", dtEnd.toLocaleDateString(navigator.language, {
                            day: 'numeric', month: 'numeric', year: 'numeric'
                        }));
                        
                    }
                    else if (resp.length === 1){
                        this.openAllocations = true;
                        let dtBegin = new Date(resp[0].dt_Confirmed);
                        this.openAllocationsMessage = this.translate.instant("SingleOpenAllocationMessage");
                        this.openAllocationsMessage = this.openAllocationsMessage.replace("{0}", dtBegin.toLocaleDateString(navigator.language, {
                            day: 'numeric', month: 'numeric', year: 'numeric'
                        }));
                    }
                }
            });
    }

    ngOnInit() {
        this.checkAllocations();
        //this.payouts = require("../models/payout").testData;

        this.apiService.getData("Payments/Payouts")
            .then(resp => {
                this.payouts = [];

                if (resp.length > 0) {
                    this.payouts = resp;
                    this.fetchWarningHighGivts()
                        .then(highGivts => {
                            console.log(highGivts);
                            if (highGivts.length > 0){
                                for (let ts of highGivts){
                                    let inPayment = false;
                                    for (let pay of this.payouts){
                                        if(pay.BeginDate < ts.TimeStamp && pay.EndDate > ts.TimeStamp){
                                            pay.HighGivtWarning = true;
                                            inPayment = true;
                                            break;
                                        }
                                    }
                                    if (!inPayment)
                                        this.unPaidHighGivt = true;
                                }
                                if (this.unPaidHighGivt){
                                    alert("unpaid high givt.");
                                }
                            }
                        });
                }
            });
    }

    fetchWarningHighGivts() {
        return this.apiService.getData("v2/collectgroups/" + this.userService.CurrentCollectGroup.GUID + "/payment/givts/outliers")
            .then(resp => {
                return resp;
            });
    }

    displayValue(x) {
        let euro = "€";
        if (!navigator.language.includes('en'))
            euro += " ";
        return euro + (this.isSafari ? (x).toFixed(2) : (x).toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }

    exportCSV() {
        this.loader["show"] = true;
        let start = this.datePipe.toISODateUTC(this.dateBegin);
        let end = this.datePipe.toISODateUTC(this.dateEnd);

        this.dataService.writeData("payoutDateBegin", Math.round(this.dateBegin.getTime() / 1000));
        this.dataService.writeData("payoutDateEnd", Math.round(this.dateEnd.getTime() / 1000));

        let apiUrl = 'Payments/CSV?dtBegin=' + start + '&dtEnd=' + end;
        this.apiService.getData(apiUrl)
            .then(resp => {
                this.loader["show"] = false;
                let csvContent = "";
                if (!navigator.userAgent.match(/Edge/g)) {
                    csvContent += "data:text/csv;charset=utf-8,";
                }
                csvContent += resp;

                let encodedUri = encodeURI(csvContent);
                let link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                let beginDate = this.datePipe.transform(new Date(this.dateBegin), "dd-MM-yyyy");
                let endDate = this.datePipe.transform(new Date(this.dateEnd), "dd-MM-yyyy");

                let fileName = this.userService.CurrentCollectGroup.Name + " - " + beginDate + " - " + endDate + ".csv";
                link.setAttribute("download", fileName);
                document.body.appendChild(link); // Required for FF

                if (window.navigator.msSaveOrOpenBlob && navigator.userAgent.match(/Edge/g)) { // for IE and Edge
                    var csvData = new Blob([resp], { type: "text/csv;charset=utf-8;" });
                    window.navigator.msSaveBlob(csvData, fileName);
                } else {
                    link.click(); // This will download the data file named "my_data.csv".
                }
            });
    }


}
