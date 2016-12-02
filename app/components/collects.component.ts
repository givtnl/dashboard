import { Component, OnInit } from '@angular/core';

import { ApiClientService } from "../services/api-client.service";
import { TranslateService } from "ng2-translate";

@Component({
    selector: 'my-collects',
    templateUrl: 'app/html/collects.component.html',
    styleUrls: ['./app/css/collects.component.css']
})
export class CollectsComponent implements OnInit {
    translate: TranslateService;
    text: string;

    constructor(private apiService: ApiClientService, translate: TranslateService) {
        this.translate = translate;
        this.apiService = apiService;
        this.text = "dit zijn de collectes";
    }

    ngOnInit(): void {

    }
}
