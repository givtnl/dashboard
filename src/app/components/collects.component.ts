import { Component, OnInit } from '@angular/core';

import { ApiClientService } from "app/services/api-client.service";
import { TranslateService } from "ng2-translate";
import {CalendarModule} from "primeng/primeng";
@Component({
    selector: 'my-collects',
    templateUrl: '../html/collects.component.html',
    styleUrls: ['../css/collects.component.css']
})
export class CollectsComponent implements OnInit {
    translate: TranslateService;
    text: string;
    calendarModule: CalendarModule;
    dateBegin: Date;
    dateEnd: Date;
    value: number = 0;
    isVisible: boolean= false;
    dateBeginRange: Date;
    dateEndRange: Date;

    dateRange: Date;
    timeRange: string;


    constructor(private apiService: ApiClientService, translate: TranslateService,calendarModule: CalendarModule) {
        this.translate = translate;
        this.apiService = apiService;
        this.text = "dit zijn de collectes";
        this.calendarModule = new CalendarModule();
    }

    ngOnInit(): void {

    }

    fetchCollect(){
        if(this.dateBegin !== undefined && this.dateEnd !== undefined){
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
                    console.log(collectSum);
                    this.value = collectSum;
                    this.dateBeginRange = this.dateBegin;
                    this.dateEndRange = this.dateEnd;
                    this.isVisible = true;  
                });
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
