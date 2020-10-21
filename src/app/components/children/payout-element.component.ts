import { Component, Input, OnInit } from '@angular/core';
import { ApiClientService } from '../../services/api-client.service';
import { TranslateService } from 'ng2-translate';
import { ViewEncapsulation } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ISODatePipe } from '../../pipes/iso.datepipe';
import { PaymentType } from '../../models/paymentType';
import { isNullOrUndefined } from 'util';

@Component({
    selector: 'payout',
    templateUrl: '../../html/children/payout.html',
    encapsulation: ViewEncapsulation.None
})
export class PayoutComponent implements OnInit {
    ngOnInit(): void {
        this.calculateCosts(this.paymentType);
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
    paymentType: PaymentType = PaymentType.Undefined;
    giftAid: boolean = false;

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
        this.giftAid = this.userService.CurrentCollectGroup.TaxDeductionType == 'GiftAid';
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
            this.moreInfoToolTip = this.moreInfoToolTip.replace('SlimPay', 'EazyCollect');
            this.moreInfoStornos = this.moreInfoStornos.replace('SlimPay', 'EazyCollect');
        } else {
            console.log('Undefined payment type');
        }
    }

    calculateCosts(paymentType: PaymentType) {
        this.dtBegin = new Date(this.childData.BeginDate);
        this.dtEnd = new Date(this.childData.EndDate);
        this.dtExecuted = new Date(this.childData.dtExecuted);
        let x = this.childData;


        x.BeginDate = this.datePipe.transform(new Date(this.childData.BeginDate), 'd MMMM y');
        x.EndDate = this.datePipe.transform(new Date(this.childData.EndDate), 'd MMMM y');
        x.dtExecuted = this.datePipe.transform(new Date(this.childData.dtExecuted), 'd MMMM y');
        if (!isNullOrUndefined(x.PaymentProviderExecutionDate))
            x.PaymentProviderExecutionDate = this.datePipe.transform(new Date(this.childData.PaymentProviderExecutionDate), 'd MMMM y');

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

        let transactionCost = 0.0;
        let RTransactionT1Cost = 0.0;

        if (paymentType === PaymentType.SEPA) {
            let mandateCost = x.MandateCostCount > 0 ? x.MandateCost / x.MandateCostCount : 0.125;
            this.translate
                .get('Text_Info_Mandate', {
                    0: x.MandateCostCount,
                    2: this.isSafari
                        ? mandateCost.toFixed(3)
                        : mandateCost.toLocaleString(navigator.language, { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
                    1: this.userService.currencySymbol
                })
                .subscribe((res: string) => {
                    x.Text_Info_Mandate = res;
                });
            let RTransactionT2Cost = x.RTransactionT2Count > 0 ? x.RTransactionT2Cost / x.RTransactionT2Count : 0;
            this.translate
                .get('Text_Info_Type2', {
                    0: x.RTransactionT2Count,
                    2: this.isSafari
                        ? RTransactionT2Cost.toFixed(2)
                        : RTransactionT2Cost.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    1: this.userService.currencySymbol
                })
                .subscribe((res: string) => {
                    x.Text_Info_Type2 = res;
                });
            RTransactionT1Cost = x.RTransactionT1Count > 0 ? x.RTransactionT1Cost / x.RTransactionT1Count : 0;
            transactionCost = x.TransactionCount > 0 ? x.TransactionCost / x.TransactionCount : 0.6;

        } else if (paymentType == PaymentType.BACS) {
            RTransactionT1Cost = x.RTransactionT1Count > 0 ? x.RTransactionT1Cost / x.RTransactionT1Count : 0;
            transactionCost = x.TransactionCount > 0 ? x.TransactionCost / x.TransactionCount : 0.14;

            if (this.giftAid) {
                // extra amount through giftaid
                x.extraGiftAidAmount = isNullOrUndefined(x.GiftAidAmountPayedByGovernment) ? 0 : x.GiftAidAmountPayedByGovernment;
                x.extraGiftAidedByGovernment = this.displayValue(x.GiftAidAmountPayedByGovernment)
                // gift aided more info
                this.translate.get('GiftAidPayoutMoreInfo').subscribe((res: string) => {
                    x.moreInfoGiftAid = res;
                });
                x.TotalText = this.displayValue(x.extraGiftAidAmount + x.TotalPaid);
                x.GiftAidAmountText = this.displayValue(x.extraGiftAidAmount);
                x.GASDSAmount = this.displayValue(x.GASDSAmount)
            }
        }

        this.translate
            .get('Text_Info_Transaction', {
                0: x.TransactionCount,
                2: this.isSafari
                    ? transactionCost.toFixed(2)
                    : transactionCost.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
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
                    ? RTransactionT1Cost.toFixed(2)
                    : RTransactionT1Cost.toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            })
            .subscribe((res: string) => {
                x.Text_Info_Type1 = res;
            });

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
            const dateTimeOffset = new Date().getTimezoneOffset() * -1;
            this.apiClient.getData(`Payments/PayoutDetail?payoutID=${this.childData.Id}&dateTimeOffset=${dateTimeOffset}`).then(resp => {
                let allocsCount: number = resp.Details.length;
                let stornoDetails = [];
                let paidDetails = [];

                for (let i = 0; i < allocsCount; i++) {
                    let detail = resp.Details[i];
                    detail.Date = this.datePipe.transform(new Date(detail.Date), 'dd-MM-yyyy');
                    detail.Status = 1;
                    // PAID details
                    if ((detail.Amount !== 0 || detail.GiftAidClaimAmount !== 0) && detail.StornoAmount == 0) {
                        if (isNullOrUndefined(detail.GiftAidClaimAmountFromGovernment))
                            detail.GiftAidClaimAmountFromGovernment  = 0.00;
                        detail.Total = detail.GiftAidClaimAmountFromGovernment + detail.Amount;
                        detail.Amount = this.displayValue(detail.Amount);
                        detail.GiftAidClaimAmountFromGovernment = this.displayValue(detail.GiftAidClaimAmountFromGovernment);
                        detail.Total = this.displayValue(detail.Total);
                        detail.GASDSClaimAmount = this.displayValue(detail.GASDSClaimAmount);
                        if (detail.Name.includes('_ERRNAC')) {
                            if (detail.Name.includes('1')) detail.Name = res + ' 1';
                            if (detail.Name.includes('2')) detail.Name = res + ' 2';
                            if (detail.Name.includes('3')) detail.Name = res + ' 3';
                            detail.Status = 2;
                        }
                        paidDetails.push(detail);
                    } else if (detail.GASDSClaimAmount > 0) {
                        detail.GASDSClaimAmount = this.displayValue(detail.GASDSClaimAmount);
                        detail.Amount = this.displayValue(0);
                        detail.GiftAidClaimAmountFromGovernment = this.displayValue(0);
                        detail.Total = this.displayValue(0);
                        if (detail.Name.includes('_ERRNAC')) {
                            if (detail.Name.includes('1')) detail.Name = res + ' 1';
                            if (detail.Name.includes('2')) detail.Name = res + ' 2';
                            if (detail.Name.includes('3')) detail.Name = res + ' 3';
                            detail.Status = 2;
                        }
                        paidDetails.push(detail);
                    }

                    // STORNO details
                    if (detail.Amount !== 0 && detail.StornoAmount !== 0) {

                        if (isNullOrUndefined(detail.GiftAidClaimAmountFromGovernment))
                            detail.GiftAidClaimAmountFromGovernment = 0.00;
                        if (!isNullOrUndefined(detail.GiftAidClaimReturnedAmountFromGovernment))
                            detail.GiftAidClaimAmountFromGovernment = detail.GiftAidClaimAmountFromGovernment - detail.GiftAidClaimReturnedAmountFromGovernment;
                        detail.Total = detail.GiftAidClaimAmountFromGovernment + detail.Amount;
                        detail.Amount = this.displayValue(detail.Amount);
                        detail.GiftAidClaimAmountFromGovernment = this.displayValue(detail.GiftAidClaimAmountFromGovernment);
                        detail.Total = this.displayValue(detail.Total);
                        detail.GASDSClaimAmount = this.displayValue(detail.GASDSClaimAmount);
                        if (detail.Name.includes('_ERRNAC')) {
                            if (detail.Name.includes('1')) detail.Name = res + ' 1';
                            if (detail.Name.includes('2')) detail.Name = res + ' 2';
                            if (detail.Name.includes('3')) detail.Name = res + ' 3';
                            detail.Status = 2;
                        }
                        stornoDetails.push(detail)
                    }
                }

                let costDetails = [];
                this.translate.get('Stornos').subscribe((resStorno: string) => {
                    for (let i = 0; i < allocsCount; i++) {
                        if (resp.Details[i].StornoAmount == 0 && resp.Details[i].GiftAidClaimReturnedAmountFromGovernment == 0) continue;
                        let copy = JSON.parse(JSON.stringify(resp.Details[i])); //copy object
                        if (copy.Name.includes("_ERRNAC")) {
                            copy.Name = copy.Name.replace("_ERRNAC", res);
                        }

                        copy.Name += ': ' + resStorno;
                        copy.Amount = '- ' + this.displayValue(resp.Details[i].StornoAmount);
                        if (isNullOrUndefined(copy.GiftAidClaimReturnedAmountFromGovernment))
                            copy.GiftAidClaimReturnedAmountFromGovernment = 0.00;
                        copy.Total = copy.GiftAidClaimReturnedAmountFromGovernment + resp.Details[i].StornoAmount;
                        copy.GiftAidClaimAmountFromGovernment = '- ' + this.displayValue(copy.GiftAidClaimReturnedAmountFromGovernment);
                        copy.Total = '- ' + this.displayValue(copy.Total);
                        copy.GASDSClaimAmount = this.displayValue(0);
                        copy.Status = 0;
                        costDetails.push(copy);
                    }
                });

                this.childData.details = paidDetails.concat(stornoDetails, costDetails);
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

        let apiUrl = 'v2/organisations/' + this.userService.CurrentCollectGroup.OrgId +
            '/collectgroups/' + this.userService.CurrentCollectGroup.GUID +
            '/payments/' + this.childData.Id + '/export?dateTimeOffset=' + new Date().getTimezoneOffset() * -1;
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
