import { Injectable } from '@angular/core';
import { Http, Headers} from '@angular/http';

import { environment } from '../../environments/environment';

import 'rxjs/add/operator/toPromise';
import {UserService} from "./user.service";
import {Router} from "@angular/router";
import {DataService} from "./data.service";
import {User} from "../models/user";

@Injectable()
export class ApiClientService {
    //this has to become environment variable in story 2461
    private apiUrl = environment.apiUrl + '/api/';
    dataService: DataService;

    constructor(private http: Http, private router: Router, dataService: DataService){
        this.dataService = dataService;
    }

    delete(path: string){
        if(!this.dataService.getData("accessToken")){
            return;
        }
        let headers = new Headers();
        headers.append('authorization', 'Bearer '+ this.dataService.getData("accessToken"));

        return this.http
            .delete(
            this.apiUrl + path,
            { headers }
            )
            .toPromise()
            .then(res => {
                return res;
            }).catch(
                err => console.log(err)
            )
    }

    postData(path: string, body: any){
        if(!this.dataService.getData("accessToken")){
            return;
        }
        let json = JSON.stringify(body);

        //Set the headers
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('authorization', 'Bearer '+ this.dataService.getData("accessToken"));

        return this.http
            .post(
                this.apiUrl + path,
                json,
                { headers }
            )
            .toPromise()
            .then(res => {
                try {
                    return res.json();
                } catch (e) {
                    return res["_body"];
                }
            }).catch(err =>  {
                if(err.status === 403){
                    this.router.navigate(['unauthorized']);
                }
                console.log(err["_body"]);
                return null;
            })
    }

  deleteData(path: string){
    if(!this.dataService.getData("accessToken")){
      return;
    }
   // let json = JSON.stringify(body);

    //Set the headers
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('authorization', 'Bearer '+ this.dataService.getData("accessToken"));
    return this.http
      .delete(
        this.apiUrl + path,
        { headers: headers }
      )
      .toPromise()
      .then(res => {
        try {
          return res.json();
        } catch (e) {
          return res["_body"];
        }
      }).catch(err =>  {
        if(err.status === 403){
          this.router.navigate(['unauthorized']);
        }
      })
  }

    getData(path: string){
        if(!this.dataService.getData("accessToken")){
            return;
        }
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('authorization', 'Bearer '+ this.dataService.getData("accessToken"));
        if (this.dataService.getData("CurrentCollectGroup"))
            headers.append('CollectGroupId', JSON.parse(this.dataService.getData("CurrentCollectGroup")).GUID);

        //do the http call
        return this.http
            .get(
                this.apiUrl + path,
                { headers }
            )
            .toPromise()
            .then(res => {
                try {
                    return res.json();
                } catch (e) {
                    return res["_body"];
                }
            }).catch(err =>  {
                if(err.status === 403 || err.status === 401){
                    this.router.navigate(['unauthorized']);
                }
            })
    }
}
