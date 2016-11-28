import { Injectable } from '@angular/core';
import {Http, Headers, URLSearchParams} from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { User } from '../models/user';

@Injectable()
export class UserService {

    private apiUrl = 'https://givtapidebug.azurewebsites.net/';

    constructor(private http: Http){
        this.loggedIn = !!localStorage.getItem('auth_token');
    }

    loggedIn: boolean = false;
    user: User = new User();

    login(username: string, password: string){
        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        let urlSearchParams = new URLSearchParams();
        urlSearchParams.append('grant_type', 'password');
        urlSearchParams.append('userName', username);
        urlSearchParams.append('password', password);
        let body = urlSearchParams.toString();

        return this.http
            .post(
                this.apiUrl+"oauth2/token",
                body,
                { headers }
            )
            .toPromise()
            .then(res => res.json());
    }
}