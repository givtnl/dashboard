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


    constructor(private apiService: ApiClientService, translate: TranslateService,calendarModule: CalendarModule) {
        this.translate = translate;
        this.apiService = apiService;
        this.text = "dit zijn de collectes";
        this.calendarModule = new CalendarModule();
    }

    ngOnInit(): void {

    }
}
