import { Component,OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';


import { ApiClientService } from "app/services/api-client.service";
import { TranslateService } from "ng2-translate";
import {CalendarModule} from "primeng/primeng";
import {Collection} from "../models/collection";
@Component({
    selector: 'my-collects',
    templateUrl: '../html/collects.component.html',
    styleUrls: ['../css/collects.component.css']
})
export class CollectsComponent implements OnInit{
    translate: TranslateService;
    text: string;
    calendarModule: CalendarModule;
    dateBegin: Date = null;
    dateEnd: Date =null;
    value: number = 0;
    dateBeginTime : number;
    maxDate: Date;
    isVisible: boolean= false;
    dateBeginRange: any;
    dateEndRange: any;
    sameDate: boolean;
    isSafari: boolean;
    savedCollects: Collection[] = [];
    collectName: string;
    collectTitle: string;
    collectId: number;
    showCosts: boolean = false;

    transactionCount: string;
    costPerTransaction: number;
    mandateCount: number;
    costPerMandate: number;
    activeRow: number = 1;

    Text_Info_Mandate: string;
    Text_Info_Transaction: string;
    Text_Info_Type1: string;
    Text_Info_Type2: string;

    //costs
    givtServiceCost: string;
    paymentProviderTransactionCost: string;

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

    ngOnInit(){
        this.fetchSavedCollects();
    }

    constructor(private apiService: ApiClientService, translate: TranslateService,calendarModule: CalendarModule) {
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
    }

    selectRow(row){
        this.activeRow = row;
    }

    fetchSavedCollects(){
        let datePipe = new DatePipe();
        this.apiService.getData("OrgAdminView/Collect")
            .then(resp => {
                this.savedCollects = resp;
                for(let i in this.savedCollects){
                    this.savedCollects[i].BeginDate = new Date(this.savedCollects[i].BeginDate + " UTC");
                    this.savedCollects[i].EndDate = new Date(this.savedCollects[i].EndDate + " UTC");
                    
                    this.savedCollects[i].BeginDateString = datePipe.transform(this.savedCollects[i].BeginDate, 'd MMMM y');
                    this.savedCollects[i].EndDateString = datePipe.transform(this.savedCollects[i].EndDate, 'd MMMM y');
                    this.savedCollects[i].BeginTimeString = datePipe.transform(this.savedCollects[i].BeginDate, 'shortTime');
                    this.savedCollects[i].EndTimeString = datePipe.transform(this.savedCollects[i].EndDate, 'shortTime');
                }
            })
    }

    selectCollect(collect: Collection){
        this.dateBegin = new Date(collect.BeginDate);
        this.dateEnd  = new Date(collect.EndDate);
        this.fetchCollect();
        this.collectId = collect.Id;
        this.collectName = collect.Name;
    }

    saveCollect(){
        let newCollect = new Collection();
        newCollect.BeginDate = this.dateBegin;
        newCollect.EndDate = this.dateEnd;
        newCollect.Name = this.collectName;

        this.apiService.postData("OrgAdminView/Collect", newCollect)
            .then(resp => {
                this.fetchSavedCollects();
                //this.collectName = "";
            })
            .catch(err => console.log(err));
        setTimeout(this.fetchSavedCollects(), 1000);
    }

    deleteCollect(id: number){
        this.apiService.delete("OrgAdminView/Collect/" + id)
            .then(resp => {
                this.isVisible = false;
                this.fetchSavedCollects();
            })
            .catch(err => console.log(err));
    }

    fetchCollect(){
        this.showCosts = false;
        this.collectTitle = null;
        if(this.dateBegin !== null && this.dateEnd !== null){
            var dateBegin = this.formatDate(this.dateBegin);
            var dateEnd = this.formatDate(this.dateEnd);
            let params = "DateBegin=" + dateBegin + "&DateEnd=" + dateEnd + "&Status=" + "0";

            this.apiService.getData("OrgAdminView/Givts/?"+params)
                .then(resp =>
                {
                    console.log(resp);
                    this.transactionCount = resp.TransactionCount;
                    this.costPerTransaction = resp.PayProvCostPerTransaction;

                    this.mandateCount = resp.PayProvMandateCost.MandateCostCount;
                    this.costPerMandate = resp.PayProvMandateCost.MandateCostAmount;

                    this.givtServiceCost = "€ " + (this.isSafari ? (resp.TotalAmount * resp.GivtCostPerTransaction).toFixed(2) : (resp.TotalAmount * resp.GivtCostPerTransaction).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}));
                    this.paymentProviderTransactionCost = "€ " + (this.isSafari ? (resp.TransactionCount * resp.PayProvCostPerTransaction).toFixed(2) : (resp.TransactionCount * resp.PayProvCostPerTransaction).toLocaleString(navigator.language,{minimumFractionDigits: 2}));
                    let collectSum = resp.TotalAmount;
                    this.value = "€ " + (this.isSafari ? collectSum.toFixed(2) : collectSum.toLocaleString(navigator.language,{minimumFractionDigits: 2}));
                    //noinspection TypeScriptValidateTypes
                    let datePipe = new DatePipe();

                    this.dateBeginRange = new Date(this.dateBegin.getTime());
                    this.dateEndRange = new Date(this.dateEnd.getTime());
                    this.sameDate = (this.dateBeginRange.getDate() === this.dateEndRange.getDate());
                    this.dateBeginRange.string = datePipe.transform(this.dateBeginRange, 'd MMMM y');
                    this.dateEndRange.string = datePipe.transform(this.dateEndRange, 'd MMMM y');
                    this.dateBeginRange.time = datePipe.transform(this.dateBegin, 'shortTime');
                    this.dateEndRange.time = datePipe.transform(this.dateEnd,'shortTime');

                    this.translate.get('Text_Info_Mandate', {0: this.mandateCount,1: this.costPerMandate}).subscribe((res: string) => {
                        this.Text_Info_Mandate = res;
                    });

                    this.translate.get('Text_Info_Transaction', {0: this.transactionCount,1: this.costPerTransaction}).subscribe((res: string) => {
                        this.Text_Info_Transaction = res;
                    });

                    this.translate.get('Text_Info_Type1', {0: 0,1: 0}).subscribe((res: string) => {
                        this.Text_Info_Type1 = res;
                    });

                    this.translate.get('Text_Info_Type2', {0: 0,1: 0,2:0}).subscribe((res: string) => {
                        this.Text_Info_Type2 = res;
                    });

                    this.isVisible = true;
                });
        }

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
        return [d.getUTCMonth()+1,
            d.getUTCDate(),
            d.getUTCFullYear()].join('/')+' '+
        [d.getUTCHours(),
            d.getUTCMinutes()].join(':');
    }
}
