import {Component, OnInit, Attribute, ViewEncapsulation} from '@angular/core';
import { DatePipe } from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
//import { BrowserAnimationsModule } from '@angular/animations';
import { ApiClientService } from "app/services/api-client.service";
import { TranslateService } from "ng2-translate";
import {CalendarModule} from "primeng/primeng";
import {Collection} from "../models/collection";
import {DataService} from "../services/data.service";
@Component({
    selector: 'my-collects',
    templateUrl: '../html/collects.component.html',
    styleUrls: ['../css/collects.component.css'],
    encapsulation: ViewEncapsulation.None
})

export class CollectsComponent implements OnInit{
    translate: TranslateService;
    text: string;
    calendarModule: CalendarModule;
    dateBegin: Date = null;
    dateEnd: Date = null;
    value: string = "";
    dateBeginTime : number;
    maxDate: Date;
    isVisible: boolean= false;
    dateBeginRange: any;
    dateEndRange: any;

    sameDate: boolean;
    isSafari: boolean;
    savedCollects: Collection[] = [];
    collectName: string = null;
    collectId: number = null;
    showCosts: boolean = false;

    SearchButtonGreen: boolean = false;

    transactionCount: number;
    costPerTransaction: number;
    mandateCount: number;
    costPerMandate: number;
    activeRow: number = 1;
    RTransactionCostType1 : string;
    RTransactionCostType2 : string;
    totalRTransactionCost : string;
    countRTransactionType1 : number;
    countRTransactionType2 : number;
    transactionCosts : string;
    mandateCosts: string;
    transactionCostsDetail: string;
    Total_Stornation: string;
    Total_Stornation2: string;
    transactionCost: string;

    Total_T_M_EXCL: string;
    Total_T_M_VAT: string;
    Total_T_M_INCL: string;
    Total_G_VAT: string;
    Total_G_INCL: string;

    Text_Info_Mandate: string;
    Text_Info_Transaction: string;
    Text_Info_Type1: string;
    Text_Info_Type2: string;

    multipleCollects: boolean = false;
    multipleCollectsId: string;

    //costs
    givtServiceCost: string;
    paymentProviderTransactionCost: string;


    ShowLoadingAnimation = false;

    en: any = {
        firstDayOfWeek: 0,
        dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        dayNamesMin: ["Su","Mo","Tu","We","Th","Fr","Sa"],
        monthNames: [ "January","February","March","April","May","June","July","August","September","October","November","December" ],
        monthNamesShort: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
    };
    nl: any = {
        firstDayOfWeek: 1,
        closeText: 'Sluiten',
        prevText: 'Terug',
        nextText: 'Volgende',
        currentText: 'Huidig',
        monthNames: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December' ],
        monthNamesShort: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec' ],
        dayNames: ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'],
        dayNamesShort: ['zo', 'ma', 'di', 'woe', 'do', 'vr', 'za'],
        dayNamesMin: ['Zo', 'Ma', 'Di', 'Wo ', 'Do', 'Vr ', 'Za'],
        weekHeader: 'Week',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix:'',
        timeOnlyTitle: 'Alleen tijd',
        timeText: 'Tijd',
        hourText: 'Uur',
        minuteText: 'Minuut',
        secondText: 'Seconde',
        ampm: false,
        month: 'Maand',
        week: 'week',
        day: 'Dag',
        allDayText: 'Alle Dagen'
    };
    locale: any;

    dateRange: Date;
    timeRange: string;

    inputTitleLength: number = 1;
    openAllocations: boolean = false;
    ngOnInit(){
      this.checkAllocations();
      this.fetchSavedCollects();
    }



    constructor(private apiService: ApiClientService, translate: TranslateService,calendarModule: CalendarModule, private datePipe: DatePipe, private dataService: DataService) {
        this.locale = this.nl;

        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        this.translate = translate;
        switch (this.translate.currentLang){
            case "nl":
                this.locale = this.nl;
                break;
            case "en":
                this.locale = this.en;
                break;
            default:
                this.locale = this.nl;
                break;
        }
        this.apiService = apiService;
        this.text = "dit zijn de collectes";
        this.calendarModule = new CalendarModule();
        this.dateBeginTime = 5000;
        this.maxDate = new Date();
        this.dateBegin = new Date();
        this.dateEnd = new Date();
        this.dateBegin.setHours(6,0,0);

        if (!!this.dataService.getData('dateBegin') && !!this.dataService.getData('dateEnd')) {
          let b = new Date(1970, 0, 1);
          let e = new Date(1970, 0, 1);
          this.dateBegin = new Date(b.setSeconds(Number(this.dataService.getData('dateBegin'))));
          this.dateEnd = new Date(e.setSeconds(Number(this.dataService.getData('dateEnd'))));

        }
    }

  checkAllocations(){
    let apiUrl = 'OrgAdminView/AllocationCheck';
    this.apiService.getData(apiUrl)
      .then(resp => {
        if(resp.length > 0){
          this.openAllocations = true;
        }
      });
  }

    selectRow(row){
        this.activeRow = row;
    }

    fetchSavedCollects(){
        return this.apiService.getData("OrgAdminView/Collect")
            .then(resp => {
                if(resp == undefined){
                    this.savedCollects = [];
                    return;
                }
                this.savedCollects = resp;
                for(let i in this.savedCollects){
                    this.savedCollects[i].BeginDate = new Date(resp[i].BeginDate + "Z");
                    this.savedCollects[i].EndDate =  new Date(resp[i].EndDate + "Z");

                    this.savedCollects[i].BeginDateString = this.datePipe.transform(this.savedCollects[i].BeginDate, 'd MMMM y');
                    this.savedCollects[i].EndDateString = this.datePipe.transform(this.savedCollects[i].EndDate, 'd MMMM y');
                    this.savedCollects[i].BeginTimeString = this.datePipe.transform(this.savedCollects[i].BeginDate, 'shortTime');
                    this.savedCollects[i].EndTimeString = this.datePipe.transform(this.savedCollects[i].EndDate, 'shortTime');
                    if(this.savedCollects[i].CollectId) {
                        this.savedCollects[i].MultipleCollects = true;
                    } else {
                        this.savedCollects[i].MultipleCollects = false;
                    }
                }

            })
    }

    selectCollect(collect: Collection){
        this.inputTitleLength = collect.Name.length-2;
        this.SearchButtonGreen = false;

        this.collectId = null;
        this.dateBegin = collect.BeginDate;
        this.dateEnd  = collect.EndDate;
        this.multipleCollects = collect.MultipleCollects;
        this.multipleCollectsId = collect.CollectId;
        this.filterCollect(this.multipleCollectsId);
        this.collectId = collect.Id;
        this.collectName = collect.Name;
        window.scrollTo(0,0);

    }

    saveCollect(){
        this.SearchButtonGreen = false;
        let newCollect = new Collection();
        newCollect.BeginDate = this.dateBegin;
        newCollect.EndDate = this.dateEnd;
        newCollect.Name = this.collectName;
        if(this.multipleCollects)
        {
            newCollect.CollectId = this.multipleCollectsId;
        }
        this.apiService.postData("OrgAdminView/Collect", newCollect)
            .then(resp => {
                this.fetchSavedCollects().then(() => {
                    this.collectId = this.savedCollects[this.savedCollects.length-1].Id;
                });

            })
            .catch(err => console.log(err));
        setTimeout(this.fetchSavedCollects(), 1000);
    }

    deleteCollect(id: number){
        this.SearchButtonGreen = false;
        if(id == undefined) return;
        this.apiService.delete("OrgAdminView/Collect/" + id)
            .then(resp => {
                this.isVisible = false;
                this.fetchSavedCollects();
                this.collectId = null;
            })
            .catch(err => console.log(err));
    }

    fetchCollect() {
      this.dataService.writeData("dateBegin", Math.round(this.dateBegin.getTime() / 1000).toString());
      this.dataService.writeData("dateEnd", Math.round(this.dateEnd.getTime() / 1000).toString());
        this.ShowLoadingAnimation = true;
        this.showCosts = false;
        if(this.dateBegin !== null && this.dateEnd !== null){
            var dateBegin = this.formatDate(this.dateBegin);
            var dateEnd = this.formatDate(this.dateEnd);
            let params;
            if(this.multipleCollects){
                params = "DateBegin=" + dateBegin + "&DateEnd=" + dateEnd + "&CollectId=" + this.multipleCollectsId;
            }else{
                params = "DateBegin=" + dateBegin + "&DateEnd=" + dateEnd;
            }

            let beginTime = new Date(this.dateBegin.valueOf()).getTime();
            let endTime = new Date(this.dateEnd.valueOf()).getTime();
            this.sameDate = ( new Date(this.dateBeginRange).getDate() ===  new Date(this.dateEndRange).getDate());
            this.dateBeginRange = new Object();
            this.dateEndRange = new Object();
            this.dateBeginRange.string = this.datePipe.transform(this.dateBegin, 'd MMMM y');
            this.dateEndRange.string = this.datePipe.transform(this.dateEnd, 'd MMMM y');
            this.dateBeginRange.time = this.datePipe.transform(beginTime, 'shortTime');
            this.dateEndRange.time = this.datePipe.transform(endTime,'shortTime');

            this.isVisible = true;

            let euro =  "€";
            if(!navigator.language.includes('en'))
                euro += " ";

            this.apiService.getData("OrgAdminView/Givts/?"+params)
                .then(resp =>
                {
                    this.transactionCount = resp.TransactionCount;
                    this.costPerTransaction = resp.PayProvCostPerTransaction;

                    this.mandateCount = resp.PayProvMandateCost.MandateCostCount;
                    this.costPerMandate = resp.PayProvMandateCost.MandateCostAmount;

                    let givtServiceCost = resp.TotalAmount * resp.GivtCostPerTransaction;
                    this.givtServiceCost = euro + (this.isSafari ? (givtServiceCost).toFixed(2) : (givtServiceCost).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}));
                    this.Total_G_VAT = this.displayValue(givtServiceCost * 0.21);
                    this.Total_G_INCL = this.displayValue(givtServiceCost * 1.21);
                    this.paymentProviderTransactionCost = euro + (this.isSafari ? (resp.TransactionCount * resp.PayProvCostPerTransaction).toFixed(2) : (resp.TransactionCount * resp.PayProvCostPerTransaction).toLocaleString(navigator.language,{minimumFractionDigits: 2}));
                    let collectSum = resp.TotalAmount;
                    this.value = euro + (this.isSafari ? collectSum.toFixed(2) : collectSum.toLocaleString(navigator.language,{minimumFractionDigits: 2}));

                    this.translate.get('Text_Info_Total_Stornos', {0: (this.isSafari ? (resp.RTransactionCost.AmountRTransaction).toFixed(2) : (resp.RTransactionCost.AmountRTransaction).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}))}).subscribe((res: string) => {
                        this.Total_Stornation = res;
                    });
                    let T_Cost = +this.transactionCount * +this.costPerTransaction;
                    let M_Cost = this.mandateCount * this.costPerMandate;
                    let Total_T_M_EXCL = +T_Cost + +M_Cost;
                    let Total_T_M_VAT = (T_Cost + M_Cost) * 0.21;
                    let Total_T_M_INCL = Total_T_M_EXCL + Total_T_M_VAT;
                    this.Total_T_M_EXCL = this.displayValue(Total_T_M_EXCL);
                    this.Total_T_M_VAT = this.displayValue(Total_T_M_VAT);
                    this.Total_T_M_INCL = this.displayValue(Total_T_M_INCL);

                    this.transactionCost = euro + (this.isSafari ? (+this.transactionCount * +this.costPerTransaction).toFixed(2) : (+this.transactionCount * +this.costPerTransaction).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}));
                    this.transactionCosts =  euro + (this.isSafari ? (this.mandateCount * this.costPerMandate + this.transactionCount * this.costPerTransaction).toFixed(2) : (this.mandateCount * this.costPerMandate + this.transactionCount * this.costPerTransaction).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}));
                    this.mandateCosts = euro + (this.isSafari ? (this.mandateCount * this.costPerMandate).toFixed(2) : (this.mandateCount * this.costPerMandate).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}));
                    this.transactionCostsDetail = euro + (this.isSafari ? (this.transactionCount * this.costPerTransaction).toFixed(2) : (this.transactionCount * this.costPerTransaction).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}));

                    this.translate.get('Text_Info_Mandate', {0: this.mandateCount,1: (this.isSafari ? (this.costPerMandate).toFixed(3) : (this.costPerMandate).toLocaleString(navigator.language,{minimumFractionDigits: 3,maximumFractionDigits:3}))}).subscribe((res: string) => {
                        this.Text_Info_Mandate = res;
                    });

                    this.translate.get('Text_Info_Transaction', {0: this.transactionCount,1: (this.isSafari ? (this.costPerTransaction).toFixed(2) : (this.costPerTransaction).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}))}).subscribe((res: string) => {
                        this.Text_Info_Transaction = res;
                    });

                    this.translate.get('Text_Info_Type1', {0: this.countRTransactionType1,1: (this.isSafari ? (0.18).toFixed(2) : (0.18).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}))}).subscribe((res: string) => {
                        this.Text_Info_Type1 = res;
                    });

                    this.translate.get('Text_Info_Type2', {0: this.countRTransactionType2,1: (this.isSafari ? (1.20).toFixed(2) : (1.20).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}))}).subscribe((res: string) => {
                        this.Text_Info_Type2 = res;
                    });
                    this.ShowLoadingAnimation = false;
                });
        }

    }

    displayValue(x)
    {
        let euro =  "€";
        if(!navigator.language.includes('en'))
            euro += " ";
        return euro + (this.isSafari ? parseFloat(x).toFixed(2) : (x).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}));
    }

    onDateBeginChange(date){
        if(this.dateEnd && this.dateEnd.getTime() <= this.dateBegin.getTime()){
            this.dateEnd = new Date(this.dateBegin.getTime() + 0.5*60*60*1000);
        }else if(!this.dateEnd){
            this.dateEnd = new Date(this.dateBegin.getTime() + 0.5*60*60*1000);
        }
    }

    onDateEndChange(date){
        if(this.dateBegin && this.dateEnd.getTime() <= this.dateBegin.getTime()){
            this.dateBegin = new Date(this.dateEnd.getTime() - 0.5*60*60*1000);
        }else if(!this.dateBegin) {
            this.dateBegin = new Date(this.dateEnd.getTime() - 0.5*60*60*1000);
        }
    }

    formatDate(d){
        d = new Date(d);
        return [d.getUTCMonth()+1,
            d.getUTCDate(),
            d.getUTCFullYear()].join('/')+' '+
        [d.getUTCHours(),
            d.getUTCMinutes()].join(':');
    }

    filterCollect(collectId){
        if(collectId == null || collectId == 0){
            this.multipleCollects = false;
        } else {
            this.multipleCollects = true;
            this.multipleCollectsId = collectId;
        }
        this.fetchCollect();
    }

}
