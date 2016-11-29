import { Injectable } from '@angular/core';
import { Http, Headers} from '@angular/http';

import 'rxjs/add/operator/toPromise';
import {UserService} from "./user.service";

@Injectable()
export class ApiClientService {
    //this has to become environment variable in story 2461
    private apiUrl = 'https://givtapidebug.azurewebsites.net/api/';

    constructor(private http: Http, private userService: UserService){

    }

    getData(path: string){
        //check for token
        let accessToken = this.userService.getAccessToken();
        if(!accessToken){
            return;
        }
        //Set the headers
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('authorization', 'Bearer '+ accessToken);

        //do the http call
        return this.http
            .get(
                this.apiUrl + path,
                { headers }
            )
            .toPromise()
            .then(res => {
                    return res.json();
                })
    }
}