import { Component, Input, OnInit } from '@angular/core';
import { ApiClientService } from '../../services/api-client.service';
import { TranslateService } from 'ng2-translate';
import { ViewEncapsulation } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ISODatePipe } from '../../pipes/iso.datepipe';
import { PaymentType } from '../../models/paymentType';

@Component({
    selector: 'payout',
    templateUrl: '../../html/children/payout.html',
    encapsulation: ViewEncapsulation.None
})
export class PayoutComponent implements OnInit {
    ngOnInit(): void {
        this.doSomeFancyStuff(this.paymentType);
    }

    displayValue(x) {
        let currencySymbol = this.userService.currencySymbol;
        if (!navigator.language.includes('en')) currencySymbol += ' ';
        return (
            currencySymbol +
            (this.isSafari ? x.toFixed(2) : x.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
        );
    }

    dtBegin: Date;
    dtEnd: Date;
    dtExecuted: Date;
    isSafari: boolean;
    @Input() childData: any;
    @Input() loader: object;
    name: string = '';
    transactionCost = 0.08;
    mandateCost = 0.125;
    paymentType: PaymentType = PaymentType.Undefined;
    showCosts: boolean = false;
    pledgedAmount: number;
    moreInfoToolTip: string;
    moreInfoStornos: string;

    constructor(
        private apiClient: ApiClientService,
        private translate: TranslateService,
        private datePipe: ISODatePipe,
        private userService: UserService
    ) {
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        this.name = 'Testen';
        this.paymentType = this.userService.CurrentCollectGroup.PaymentType;
        this.translate
            .get(this.paymentType === PaymentType.SEPA ? 'Text_TransactionCost_MoreInfo' : 'Text_TransactionCost_MoreInfo_GB')
            .subscribe((res: string) => {
                this.moreInfoToolTip = res;
            });
        this.translate.get('Text_Stornos_MoreInfo').subscribe((res: string) => {
            this.moreInfoStornos = res;
        });
        if (this.paymentType === PaymentType.BACS) {
            this.transactionCost = 0.1;
            this.mandateCost = 0;
            this.moreInfoToolTip = this.moreInfoToolTip.replace('SlimPay', 'SmartDebit');
            this.moreInfoStornos = this.moreInfoStornos.replace('SlimPay', 'SmartDebit');
        } else if (this.paymentType === PaymentType.SEPA) {
            this.transactionCost = 0.08;
            this.mandateCost = 0.125;
        } else {
            console.log('Undefined payment type');
        }
    }

    doSomeFancyStuff(paymentType: PaymentType) {
        this.dtBegin = new Date(this.childData.BeginDate);
        this.dtEnd = new Date(this.childData.EndDate);
        this.dtExecuted = new Date(this.childData.dtExecuted);

        let x = this.childData;
        x.BeginDate = this.datePipe.transform(new Date(this.childData.BeginDate), 'd MMMM y');
        x.EndDate = this.datePipe.transform(new Date(this.childData.EndDate), 'd MMMM y');
        x.dtExecuted = this.datePipe.transform(new Date(this.childData.dtExecuted), 'd MMMM y');

        paymentType === PaymentType.SEPA ? (x.Mandaatkosten = x.MandateCost) : (x.Mandaatkosten = 0);

        x.Transactiekosten = x.TransactionCost;
        x.Uitbetalingskosten = x.PayoutCost;
        x.T_Total_Excl = x.Mandaatkosten + x.Transactiekosten + x.Uitbetalingskosten;
        x.T_BTW = x.MandateTaxes + x.TransactionTaxes + x.PayoutCostTaxes;
        x.T_Total_Incl = x.T_Total_Excl + x.T_BTW;

        x.SK_Total_Incl = x.RTransactionT1Cost + x.RTransactionT2Cost + x.RTransactionTaxes;
        x.G_Total_Incl = x.GivtServiceFee + x.GivtServiceFeeTaxes;

        //tr fee + storno fee + givt fee + storno bedragen
        x.TotaalKosten = x.T_Total_Incl + x.SK_Total_Incl + x.G_Total_Incl;
        x.TotaalInhoudingen = x.TotaalKosten + x.RTransactionAmount;
        x.ToegezegdBedrag = x.TotaalInhoudingen + x.TotalPaid;

        this.pledgedAmount = x.ToegezegdBedrag;

        paymentType === PaymentType.SEPA ? (x.Mandaatkosten = this.displayValue(x.Mandaatkosten)) : (x.Mandaatkosten = 0);
        x.Transactiekosten = this.displayValue(x.Transactiekosten);
        x.UitbetalingskostenIncl = this.displayValue(x.PayoutCost + x.PayoutCostTaxes);
        x.UitbetalingskostenFormatted = this.displayValue(x.Uitbetalingskosten);
        x.T_Total_Excl = this.displayValue(x.T_Total_Excl);
        x.T_BTW = this.displayValue(x.T_BTW);
        x.T_Total_Incl = this.displayValue(x.T_Total_Incl);

        // storno kost
        x.StorneringsKostenT1 = this.displayValue(x.RTransactionT1Cost);
        paymentType === PaymentType.SEPA ? (x.StorneringsKostenT2 = this.displayValue(x.RTransactionT2Cost)) : (x.StorneringsKostenT2 = 0);
        paymentType === PaymentType.SEPA
            ? (x.SK_Total_Excl = this.displayValue(x.RTransactionT1Cost + x.RTransactionT2Cost))
            : (x.SK_Total_Excl = this.displayValue(x.RTransactionT1Cost));
        x.SK_BTW = this.displayValue(x.RTransactionTaxes);
        x.SK_Total_Incl = this.displayValue(x.SK_Total_Incl);

        x.G_Total_Excl = this.displayValue(x.GivtServiceFee);
        x.G_BTW = this.displayValue(x.GivtServiceFeeTaxes);
        x.G_Total_Incl = this.displayValue(x.G_Total_Incl);

        x.GestorneerdeBedragen = this.displayValue(x.RTransactionAmount);
        x.TotaalKosten = this.displayValue(x.TotaalKosten);
        x.TotaalInhoudingen = this.displayValue(x.TotaalInhoudingen);

        x.ToegezegdBedrag = this.displayValue(x.ToegezegdBedrag);

        x.hiddenOverview = true;
        x.hiddenAllocations = true;
        x.TotalPaidText = this.displayValue(x.TotalPaid);

        if (paymentType === PaymentType.SEPA) {
            this.translate
                .get('Text_Info_Mandate', {
                    0: x.MandateCostCount,
                    2: this.isSafari
                        ? this.mandateCost.toFixed(3)
                        : this.mandateCost.toLocaleString(navigator.language, { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
                    1: this.userService.currencySymbol
                })
                .subscribe((res: string) => {
                    x.Text_Info_Mandate = res;
                });
        }

        this.translate
            .get('Text_Info_Transaction', {
                0: x.TransactionCount,
                2: this.isSafari
                    ? this.transactionCost.toFixed(2)
                    : this.transactionCost.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                1: this.userService.currencySymbol
            })
            .subscribe((res: string) => {
                x.Text_Info_Transaction = res;
            });

        this.translate
            .get('Text_Info_Type1', {
                0: x.RTransactionT1Count,
                1: this.userService.currencySymbol,
                2: this.isSafari
                    ? (0.18).toFixed(2)
                    : (0.18).toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            })
            .subscribe((res: string) => {
                x.Text_Info_Type1 = res;
            });

        if (paymentType === PaymentType.SEPA) {
            this.translate
                .get('Text_Info_Type2', {
                    0: x.RTransactionT2Count,
                    2: this.isSafari
                        ? (1.2).toFixed(2)
                        : (1.2).toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    1: this.userService.currencySymbol
                })
                .subscribe((res: string) => {
                    x.Text_Info_Type2 = res;
                });
        } else if (paymentType === PaymentType.BACS && this.userService.CurrentCollectGroup.TaxDeductionType == 'GiftAid') {
            // extra amount through giftaid
            x.extraGiftAidAmount = x.GiftAidAmountPayedByGovernment != undefined ? x.GiftAidAmountPayedByGovernment : 0;
            // gift aided more info
            this.translate.get('GiftAidPayoutMoreInfo', { 0: x.GiftAidAmount }).subscribe((res: string) => {
                x.moreInfoGiftAid = res;
            });
            if (x.extraGiftAidAmount == 0) {
                x.moreInfoGiftAid = x.moreInfoGiftAid.substring(this.getPosition(x.moreInfoGiftAid, '.', 2) + 2);
            }
        }

        x.activeRow = 1;
    }

    openPayout() {
        this.childData.hiddenAllocations = true;
        this.childData.hiddenOverview = !this.childData.hiddenOverview;
    }

    openAllocations() {
        this.fetchPayoutDetail();
        this.childData.hiddenOverview = true;
        this.childData.hiddenAllocations = !this.childData.hiddenAllocations;
    }

    closeOverview() {
        this.childData.hiddenOverview = true;
    }

    closeAllocations() {
        this.childData.hiddenAllocations = true;
    }

    selectRow(x, y) {
        x.activeRow = y;
    }

    fetchPayoutDetail() {
        this.translate.get('NonAllocatedCollect').subscribe((res: string) => {
            this.apiClient.getData('Payments/PayoutDetail?payoutID=' + this.childData.Id).then(resp => {
                let allocsCount: number = resp.Details.length;
                let paidDetails = [];
                for (let i = 0; i < allocsCount; i++) {
                    let detail = resp.Details[i];
                    detail.Date = this.datePipe.transform(new Date(detail.Date), 'dd-MM-yyyy');
                    detail.Status = 1;
                    if (detail.Amount !== 0 && detail.Amount > detail.StornoAmount) {
                        detail.Amount = this.displayValue(detail.Amount);
                        if (detail.Name.includes('_ERRNAC')) {
                            if (detail.Name.includes('1')) detail.Name = res + ' 1';
                            if (detail.Name.includes('2')) detail.Name = res + ' 2';
                            if (detail.Name.includes('3')) detail.Name = res + ' 3';
                            detail.Status = 2;
                        }
                        paidDetails.push(detail);
                    }
                }

                let costDetails = [];
                this.translate.get('Stornos').subscribe((res: string) => {
                    for (let i = 0; i < allocsCount; i++) {
                        if (resp.Details[i].StornoAmount == 0) continue;
                        let copy = JSON.parse(JSON.stringify(resp.Details[i])); //copy object
                        copy.Name += ': ' + res;
                        copy.Amount = '- ' + this.displayValue(resp.Details[i].StornoAmount);
                        copy.Status = 0;
                        costDetails.push(copy);
                    }
                });

                this.childData.details = paidDetails.concat(costDetails);
            });
        });
    }
    getPosition(string: string, subString: string, index: number) {
        return string.split(subString, index).join(subString).length;
    }
    exportCSV() {
        this.loader['show'] = true;
        let dtStart = new Date(this.dtExecuted);
        let dtEnd = new Date(this.dtExecuted);
        dtStart.setDate(dtStart.getDate() - 1);
        dtEnd.setDate(dtEnd.getDate() + 1);
        let start = this.datePipe.toISODateUTC(dtStart);
        let end = this.datePipe.toISODateUTC(dtEnd);

        let apiUrl = 'Payments/CSV?dtBegin=' + start + '&dtEnd=' + end + '&offSet=' + new Date().getTimezoneOffset() * -1;
        this.apiClient.getData(apiUrl).then(resp => {
            this.loader['show'] = false;
            var csvContent = '';
            if (!navigator.userAgent.match(/Edge/g)) {
                csvContent += 'data:text/csv;charset=utf-8,';
            }
            csvContent += resp;

            var encodedUri = encodeURI(csvContent);
            var link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            let fileDate = this.datePipe.transform(new Date(this.dtExecuted), 'dd-MM-yyyy');

            let fileName = `${this.userService.CurrentCollectGroup.Name}_${fileDate}.csv`;
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
