import {Injectable} from '@angular/core';
import { Http, Headers, URLSearchParams } from '@angular/http';
import { CustomQueryEncoderHelper } from '../helpers/customQueryEncoder';


import 'rxjs/add/operator/toPromise'; //to support toPromise
import { environment } from '../../environments/environment';

import { User } from '../models/user';
import { DataService } from "./data.service";

@Injectable()
export class UserService {
    //this has to become environment variable in story 2461
    private apiUrl = environment.apiUrl + '/oauth2/token';

    constructor(private dataService: DataService, private http: Http){
        this.loggedIn = !!dataService.getData("accessToken");
        this.SiteAdmin = dataService.getData("SiteAdmin") == "True";
    }

    loggedIn: boolean = false;
    SiteAdmin: boolean = false;
    user: User = new User();

    login(username: string, password: string){
        //Set the headers
        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        //set the x-www-form-urlencoded parameters
        let urlSearchParams = new URLSearchParams('', new CustomQueryEncoderHelper());
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
                    this.dataService.writeData("accessToken", res.json().access_token);
                    if (res.json().hasOwnProperty("SiteAdmin"))
                        this.dataService.writeData("SiteAdmin", res.json().SiteAdmin);
                    this.SiteAdmin = this.dataService.getData("SiteAdmin") == "True";
                }
                else{
                    return false;
                }
            })
    }

    logout(){
        this.loggedIn = false;
        this.SiteAdmin = false;
        this.dataService.clearAll();
    }

    getAccessToken(){
        return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    }

    requestNewPass(email){
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post(environment.apiUrl + '/api/Users/ForgotPassword?dashboard=true', "\""+email+"\"", { headers })
            .toPromise()
            .then(res=>{
                return res;
            });
    }

    saveNewPass(email, token, newPass){
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        var x = {"userID":email, "passwordToken":token,"newPassword":newPass}
        return this.http.post(environment.apiUrl + '/api/Users/ResetPassword', x, { headers })
            .toPromise()
            .then(res=>{
                return res;
            });
    }
}
