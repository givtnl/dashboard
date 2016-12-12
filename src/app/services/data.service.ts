import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise'; //to support toPromise

import {ApiClientService} from "./api-client.service";
import {UserService} from "./user.service";

@Injectable()
export class DataService {

    apiService: ApiClientService;
    userService: UserService;
    public instanceTitle: string;

    constructor(private apiService: ApiClientService, userService: UserService) {
        this.apiService = apiService;
        this.userService = userService;
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
                }).catch(
                )
        }
    }



}