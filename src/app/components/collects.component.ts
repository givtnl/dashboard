import { Component } from '@angular/core';

import { ApiClientService } from "app/services/api-client.service";
import { TranslateService } from "ng2-translate";
import {CalendarModule} from "primeng/primeng";
@Component({
    selector: 'my-collects',
    templateUrl: '../html/collects.component.html',
    styleUrls: ['../css/collects.component.css']
})
export class CollectsComponent{
    translate: TranslateService;
    text: string;
    calendarModule: CalendarModule;
    dateBegin: Date = null;
    dateEnd: Date =null;
    value: number = 0;
    dateBeginTime : number;
    maxDate: Date;
    isVisible: boolean= false;
    dateBeginRange: Date;
    dateEndRange: Date;
    sameDate: boolean;
    isSafari: boolean;

    dateRange: Date;
    timeRange: string;

    constructor(private apiService: ApiClientService, translate: TranslateService,calendarModule: CalendarModule) {
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        this.translate = translate;
        this.apiService = apiService;
        this.text = "dit zijn de collectes";
        this.calendarModule = new CalendarModule();
        this.dateBeginTime = 5000;
        this.maxDate = new Date();
    }

    fetchCollect(){
        if(this.dateBegin !== null && this.dateEnd !== null){
            var dateBegin = this.formatDate(this.dateBegin);
            var dateEnd = this.formatDate(this.dateEnd);
            let params = "DateBegin=" + dateBegin + "&DateEnd=" + dateEnd + "&Status=" + "0";

            this.apiService.getData("OrgAdminView/Givts/?"+params)
                .then(resp =>
                {
                    let collectSum = 0;
                    for(let givt in resp){
                        collectSum = collectSum + resp[givt].Amount;
                    }
                    //this.value = collectSum;
                    this.value = "€ " + (this.isSafari ? collectSum.toFixed(2) : collectSum.toLocaleString(navigator.language,{minimumFractionDigits: 2}));
                    this.dateBeginRange = new Date(this.dateBegin.getTime());
                    this.dateEndRange = new Date(this.dateEnd.getTime());
                    this.sameDate = (this.dateBeginRange.getDate() === this.dateEndRange.getDate());
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
        return [d.getMonth()+1,
            d.getDate(),
            d.getFullYear()].join('/')+' '+
        [d.getHours(),
            d.getMinutes()].join(':');
    }
}
