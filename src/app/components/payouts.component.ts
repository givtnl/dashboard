import { Component, OnInit, isDevMode } from '@angular/core';

import { ApiClientService } from 'app/services/api-client.service';
import { Payout } from '../models/payout';
import { TranslateService } from 'ng2-translate';
import { ViewEncapsulation } from '@angular/core';
import { DataService } from '../services/data.service';
import { UserService } from '../services/user.service';
import { ISODatePipe } from '../pipes/iso.datepipe';
import { from } from 'rxjs/observable/from';
import { delay } from 'rxjs/operators';

@Component({
    selector: 'my-collects',
    templateUrl: '../html/payouts.component.html',
    styleUrls: ['../css/payouts.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class PayoutsComponent implements OnInit {
    openAllocations: boolean = false;
    public loading = false;
    payouts: Payout[] = [];
    isSafari: boolean;

    transactionCost = 0.08;
    mandateCost = 0.125;
    R1Cost = 0.18;
    R2Cost = 1.2;
    translate: TranslateService;

    dateBegin: Date = null;
    dateEnd: Date = null;
    loader: object = { show: false };
    openAllocationsMessage: string;
    questionsGoToManualMessage: string;

    constructor(
        private apiService: ApiClientService,
        private dataService: DataService,
        translate: TranslateService,
        private datePipe: ISODatePipe,
        private userService: UserService
    ) {
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
        this.translate.get('QuestionsProccessingTransactionsAndPayouts').subscribe(value => {
            this.questionsGoToManualMessage = value;
        });
    }

    checkAllocations() {
        let apiUrl = 'v2/collectgroups/' + this.userService.CurrentCollectGroup.GUID + '/allocations/non-allocated/date-bounds';

        this.apiService.getData(apiUrl).then(resp => {
            if (resp) {
                if (resp.length === 2) {
                    this.openAllocations = true;
                    let dtBegin = new Date(resp[0].dt_Confirmed);
                    let dtEnd = new Date(resp[1].dt_Confirmed);
                    this.openAllocationsMessage = this.translate.instant('MultipleOpenAllocationsMessage');
                    this.openAllocationsMessage = this.openAllocationsMessage.replace(
                        '{0}',
                        dtBegin.toLocaleDateString(navigator.language, {
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric'
                        })
                    );
                    this.openAllocationsMessage = this.openAllocationsMessage.replace(
                        '{1}',
                        dtEnd.toLocaleDateString(navigator.language, {
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric'
                        })
                    );
                } else if (resp.length === 1) {
                    this.openAllocations = true;
                    let dtBegin = new Date(resp[0].dt_Confirmed);
                    this.openAllocationsMessage = this.translate.instant('SingleOpenAllocationMessage');
                    this.openAllocationsMessage = this.openAllocationsMessage.replace(
                        '{0}',
                        dtBegin.toLocaleDateString(navigator.language, {
                            day: 'numeric',
                            month: 'numeric',
                            year: 'numeric'
                        })
                    );
                }
            }
        });
    }

    ngOnInit() {
        this.checkAllocations();
        this.loading = true;
        from(this.apiService.getData('Payments/Payouts'))
        .pipe(delay(500))
        .subscribe((resp: Payout[]) => {
            this.payouts = [];
            if (resp.length > 0) {
                this.payouts = resp;
            }
        }).add(() => this.loading =false);
    }

    displayValue(x) {
        let currencySymbol = this.userService.currencySymbol;
        if (!navigator.language.includes('en')) currencySymbol += ' ';
        return (
            currencySymbol +
            (this.isSafari ? x.toFixed(2) : x.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
        );
    }

    exportCSV() {
        this.loader['show'] = true;
        let start = this.datePipe.toISODateUTC(this.dateBegin);
        let end = this.datePipe.toISODateUTC(this.dateEnd);

        this.dataService.writeData('payoutDateBegin', Math.round(this.dateBegin.getTime() / 1000));
        this.dataService.writeData('payoutDateEnd', Math.round(this.dateEnd.getTime() / 1000));

        let apiUrl = 'v2/collectgroups/' + this.userService.CurrentCollectGroup.GUID + '/payments/export?startDate=' + start + '&endDate=' + end + '&dateTimeOffset=' + new Date().getTimezoneOffset() * -1;
        this.apiService.getData(apiUrl).then(resp => {
            this.loader['show'] = false;
            var csvContent = '';
            if (!navigator.userAgent.match(/Edge/g)) {
                csvContent += 'data:text/csv;charset=utf-8,';
            }
            csvContent += resp;

            var encodedUri = encodeURI(csvContent);
            var link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            let beginDate = this.datePipe.transform(new Date(this.dateBegin), 'dd-MM-yyyy');
            let endDate = this.datePipe.transform(new Date(this.dateEnd), 'dd-MM-yyyy');

            let fileName = this.userService.CurrentCollectGroup.Name + ' - ' + beginDate + ' - ' + endDate + '.csv';
            link.setAttribute('download', fileName);
            document.body.appendChild(link); // Required for FF

            if (window.navigator.msSaveOrOpenBlob && navigator.userAgent.match(/Edge/g)) {
                // for IE and Edge
                var csvData = new Blob([resp], { type: 'text/csv;charset=utf-8;' });
                window.navigator.msSaveBlob(csvData, fileName);
            } else {
                link.click(); // This will download the data file named "my_data.csv".
            }
        });
    }
}
