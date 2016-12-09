import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise'; //to support toPromise

import {ApiClientService} from "./api-client.service";

@Injectable()
export class DataService {

    apiService: ApiClientService;
    public instanceTitle: string;

    constructor(private apiService: ApiClientService) {
        this.apiService = apiService;
    }

    getInstanceTitle() : string{
        if(this.instanceTitle)
        {
            return this.instanceTitle;
        }
        else{
            return this.apiService.getData('OrgAdminView/Org')
                .then(res => {
                    this.instanceTitle = res;
                    return res;
                });
        }
    }



}