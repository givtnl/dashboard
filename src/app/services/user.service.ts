import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import 'rxjs/add/operator/toPromise'; //to support toPromise
import { User } from '../models/user';
import { DataService } from "./data.service";
import { ApiClientService } from "./api-client.service";
import { EventEmitter, Output } from "@angular/core";
import { PaymentType } from "../models/paymentType";
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { getApiUrl } from './helpers/api-url.helper';
import { UserDetailModel } from '../models/user-detail.model';


@Injectable()
export class UserService {
    @Output() collectGroupChanged: EventEmitter<any> = new EventEmitter();
    @Output() userLoggedOut: EventEmitter<any> = new EventEmitter();

    private apiLoginiUrl:string;
    private apiUrl:string;

    constructor(private dataService: DataService, private apiService: ApiClientService, private http: HttpClient, private router: Router) {
        this.apiLoginiUrl = getApiUrl() + '/oauth2/token';
        this.apiUrl = getApiUrl();
        this.loggedIn = !!dataService.getData("accessToken");
        this.SiteAdmin = dataService.getData("SiteAdmin") == "True";
        this.GivtOperations = dataService.getData("GivtOperations") == "True";
        let d = dataService.getData("CollectGroups");
        this.CollectGroups = d && d != 'undefined' ? JSON.parse(d) : [];
        d = dataService.getData("CurrentCollectGroup")
        this.CurrentCollectGroup = d && d != 'undefined' ? JSON.parse(d) : null;
    }

    loggedIn: boolean = false;
    SiteAdmin: boolean = false;
    GivtOperations: boolean = false;
    public CollectGroups: Array<any> = null;
    public CurrentCollectGroup: any = null;
    user: User = new User();

    get currencySymbol(): string {
        switch (this.CurrentCollectGroup.PaymentType) {
            case PaymentType.BACS: return "£";
            case PaymentType.CreditCard: return "$";
            case PaymentType.SEPA:
            default:
                return "€";
        }
    }

    patchLanguage(userId: string, language: string): Observable<object> {
        return this.http.patch(`${this.apiUrl}/api/v2/users/${userId}/language/${language}`, {});
    }

    getCurrentUser(): Observable<UserDetailModel> {
        return this.http.get<UserDetailModel>(`${this.apiUrl}/api/v2/users`);
    }

    loginHttpCall(body: string, headers: HttpHeaders) {
        return this.http
            .post(
                this.apiLoginiUrl,
                body,
                { headers }
            )
            .toPromise()
            .then(res => {
                if (res['access_token']) {
                    this.loggedIn = true;
                    this.startTimedLogout(res['expires_in'] * 1000);
                    this.dataService.writeData("UserEmail", res['Email']);
                    this.dataService.writeData("accessToken", res['access_token']);
                    if (res.hasOwnProperty("SiteAdmin"))
                        this.dataService.writeData("SiteAdmin", res['SiteAdmin']);
                    this.SiteAdmin = this.dataService.getData("SiteAdmin") == "True";

                    if (res.hasOwnProperty("GivtOperations"))
                        this.dataService.writeData("GivtOperations", res['GivtOperations']);
                    this.GivtOperations = this.dataService.getData("GivtOperations") == "True";

                    if (res.hasOwnProperty("CollectGroupAdmin")) {
                        return this.apiService.getData('CollectGroupView/CollectGroup')
                            .then(res => {
                                this.dataService.writeData("CollectGroups", JSON.stringify(res));
                                if (!this.CurrentCollectGroup || this.CollectGroups.indexOf(this.CurrentCollectGroup) < 0)
                                    this.dataService.writeData("CurrentCollectGroup", JSON.stringify(res[0]));
                                this.CurrentCollectGroup = JSON.parse(this.dataService.getData("CurrentCollectGroup"));
                                this.CollectGroups = JSON.parse(this.dataService.getData("CollectGroups"));
                                return true;
                            }).catch(_ => {
                                err => console.log(err);
                                return false;
                            });
                    } else {
                        this.dataService.removeOne("CurrentCollectGroup");
                        if (!this.GivtOperations && !this.SiteAdmin)
                            return false;
                    }
                    return true;
                }
                else {
                    return false;
                }
            })
    }

    loginWithRefreshtoken(access_token: string, refresh_token: string) {
        //Set the headers
        let headers = new HttpHeaders();
        headers.append('authorization', 'Bearer ' + access_token);
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        //set the x-www-form-urlencoded parameters
        let urlSearchParams = new URLSearchParams('');
        urlSearchParams.append('grant_type', 'refresh_token');
        urlSearchParams.append('refresh_token', refresh_token);

        //set to string
        let body = urlSearchParams.toString();

        //do the http call
        return this.loginHttpCall(body, headers);
    }

    login(username: string, password: string) {
        let d = this.dataService.getData("CurrentCollectGroup");
        this.CurrentCollectGroup = typeof d != 'undefined' ? JSON.parse(d) : null;
        //Set the headers
        let headers = new HttpHeaders();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        //set the x-www-form-urlencoded parameters
        let urlSearchParams = new URLSearchParams('');
        urlSearchParams.append('grant_type', 'password');
        urlSearchParams.append('userName', username);
        urlSearchParams.append('password', password);
        //set to string
        let body = urlSearchParams.toString();

        return this.loginHttpCall(body, headers);
    }

    startTimedLogout(ms) {
        setTimeout(() => {
            this.logout();
            this.router.navigate(['loggedout']);
        }, ms);
    }

    logout() {
        this.loggedIn = false;
        this.SiteAdmin = false;
        this.dataService.clearAll();
        this.userLoggedOut.emit(null);
    }

    requestNewPass(email) {
        let headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http.post(this.apiUrl + '/api/Users/ForgotPassword?dashboard=true', "\"" + email + "\"", { headers })
            .toPromise()
            .then(res => {
                return res;
            });
    }

    saveNewPass(email, token, newPass) {
        let headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        var x = { "userID": email, "passwordToken": token, "newPassword": newPass }
        return this.http.post(this.apiUrl + '/api/Users/ResetPassword', x, { headers })
            .toPromise()
            .then(res => {
                return res;
            });
    }

    changeCollectGroup(cg) {
        if (this.CollectGroups.indexOf(cg) > -1) {
            this.dataService.writeData("CurrentCollectGroup", JSON.stringify(cg));
            this.CurrentCollectGroup = cg;
            this.collectGroupChanged.emit(null);
        }
    }
}
