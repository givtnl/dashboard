import {Injectable} from '@angular/core';
import { Http, Headers, URLSearchParams } from '@angular/http';
import { CustomQueryEncoderHelper } from '../helpers/customQueryEncoder';
import {Router} from "@angular/router";
import 'rxjs/add/operator/toPromise'; //to support toPromise
import { environment } from '../../environments/environment';

import { User } from '../models/user';
import { DataService } from "./data.service";
import { ApiClientService} from "./api-client.service";
import { EventEmitter, Output } from "@angular/core";
import { PaymentType } from "../models/paymentType";

@Injectable()
export class UserService {
    @Output() collectGroupChanged: EventEmitter<any> = new EventEmitter();
    @Output() userLoggedOut: EventEmitter<any> = new EventEmitter();

	//this has to become environment variable in story 2461
    private apiUrl = environment.apiUrl + '/oauth2/token';

    constructor(private dataService: DataService, private apiService: ApiClientService, private http: Http, private router: Router){
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
        return this.CurrentCollectGroup.PaymentType == PaymentType.BACS ? "£" : "€";
    }

    login(username: string, password: string) {
        let d = this.dataService.getData("CurrentCollectGroup");
        this.CurrentCollectGroup = typeof d != 'undefined' ? JSON.parse(d) : null;
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
                    this.startTimedLogout(res.json().expires_in * 1000);
                    this.dataService.writeData("accessToken", res.json().access_token);

                    if (res.json().hasOwnProperty("SiteAdmin"))
                        this.dataService.writeData("SiteAdmin", res.json().SiteAdmin);
                    this.SiteAdmin = this.dataService.getData("SiteAdmin") == "True";

                    if (res.json().hasOwnProperty("GivtOperations"))
                        this.dataService.writeData("GivtOperations", res.json().GivtOperations);
                    this.GivtOperations = this.dataService.getData("GivtOperations") == "True";

                    if (res.json().hasOwnProperty("CollectGroupAdmin")) {
                        return this.apiService.getData('CollectGroupView/CollectGroup')
                            .then(res => {
                                this.dataService.writeData("CollectGroups", JSON.stringify(res));
                                if (!this.CurrentCollectGroup || this.CollectGroups.indexOf(this.CurrentCollectGroup) < 0)
                                    this.dataService.writeData("CurrentCollectGroup", JSON.stringify(res[0]));
                                this.CurrentCollectGroup = JSON.parse(this.dataService.getData("CurrentCollectGroup"));
                                this.CollectGroups = JSON.parse(this.dataService.getData("CollectGroups"));
                                return true;
                            }).catch( _ => {
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

    startTimedLogout(ms){
        setTimeout(()=>{
            this.logout();
            this.router.navigate(['loggedout']);
        }, ms);
    }

    logout(){
        this.loggedIn = false;
        this.SiteAdmin = false;
        this.dataService.clearAll();
        this.userLoggedOut.emit(null);
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

    changeCollectGroup(cg) {
        if (this.CollectGroups.indexOf(cg) > -1) {
            this.dataService.writeData("CurrentCollectGroup", JSON.stringify(cg));
            this.CurrentCollectGroup = cg;
            this.collectGroupChanged.emit(null);
        }
    }
}
