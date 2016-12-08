import { Injectable } from '@angular/core';
import { Http, Headers, URLSearchParams } from '@angular/http';

import 'rxjs/add/operator/toPromise'; //to support toPromise
import { environment } from '../../environments/environment';

import { User } from '../models/user';

@Injectable()
export class UserService {
    //this has to become environment variable in story 2461
    private apiUrl = environment.apiUrl + '/oauth2/token';

    constructor(private http: Http){
        if(localStorage.getItem('access_token'))
            this.loggedIn = !!localStorage.getItem('access_token');
        else if(sessionStorage.getItem('access_token'))
            this.loggedIn = !!sessionStorage.getItem('access_token');
        console.log(this.loggedIn);
    }

    loggedIn: boolean = false;
    user: User = new User();

    login(username: string, password: string, stayloggedin: boolean = false){
        //Set the headers
        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        //set the x-www-form-urlencoded parameters
        let urlSearchParams = new URLSearchParams();
        urlSearchParams.append('grant_type', 'password');
        urlSearchParams.append('userName', username);
        urlSearchParams.append('password', password);
        //set to string
        let body = urlSearchParams.toString();

        //do the http call
        return this.http
            .post(
                this.apiUrl,
                body,
                { headers }
            )
            .toPromise()
            .then(res => {
                if(res.json().access_token){
                    this.loggedIn = true;
                    if(stayloggedin){
                        localStorage.setItem('access_token', res.json().access_token);
                    }else{
                        sessionStorage.setItem('access_token', res.json().access_token);
                    }
                    return true;
                }
                else{
                    return false;
                }
            })
    }

    logout(){
        sessionStorage.clear();
        localStorage.clear();
        this.loggedIn = false;
    }

    getAccessToken(){
        return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    }
}