import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';
import {Router} from "@angular/router";
import {DataService} from "./data.service";
import {reject} from "q";

import { getApiUrl } from './helpers/api-url.helper';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class ApiClientService {
    private apiUrl: string;
    dataService: DataService;

    constructor(private http: HttpClient, private router: Router, dataService: DataService){
        this.dataService = dataService;
        this.apiUrl = getApiUrl() + '/api/';
    }

    delete(path: string){
        let headers = new HttpHeaders();
        if(this.dataService.getData("accessToken")){
            headers.append('authorization', 'Bearer '+ this.dataService.getData("accessToken"));
        }
        if (this.dataService.getData("CurrentCollectGroup"))
            headers.append('CollectGroupId', JSON.parse(this.dataService.getData("CurrentCollectGroup")).GUID);

        return this.http
            .delete(
            this.apiUrl + path,
            { headers }
            )
            .toPromise()
            .then(res => {
                return res;
            }).catch(err => { 
                console.log(err);
                return reject(err);
            });
    }

    postData(path: string, body: any){
        if(!this.dataService.getData("accessToken")){
            return;
        }
        let json = JSON.stringify(body);

        //Set the headers
        let headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        headers.append('authorization', 'Bearer '+ this.dataService.getData("accessToken"));
        if (this.dataService.getData("CurrentCollectGroup"))
            headers.append('CollectGroupId', JSON.parse(this.dataService.getData("CurrentCollectGroup")).GUID);

        return this.http
            .post(
                this.apiUrl + path,
                json,
                { headers }
            )
            .toPromise()
            .then(res => {
                try {
                    return res;
                } catch (e) {
                    return res["_body"];
                }
            }).catch(err =>  {
                if(err.status === 403){
                    this.router.navigate(['unauthorized']);
                }
                try {
                    console.error(JSON.stringify(JSON.parse(err["_body"]), null, 2));
                } catch (e) {
                    console.error(err["_body"])
                }
                return reject(err);
            });
    }

    deleteData(path: string){
      if(!this.dataService.getData("accessToken")){
        return;
      }
     // let json = JSON.stringify(body);

      //Set the headers
      let headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      headers.append('authorization', 'Bearer '+ this.dataService.getData("accessToken"));
      if (this.dataService.getData("CurrentCollectGroup"))
        headers.append('CollectGroupId', JSON.parse(this.dataService.getData("CurrentCollectGroup")).GUID);

      return this.http
        .delete(
          this.apiUrl + path,
          { headers: headers }
        )
        .toPromise()
        .then(res => {
          try {
            return res;
          } catch (e) {
            return res["_body"];
          }
        }).catch(err =>  {
          if(err.status === 403){
            this.router.navigate(['unauthorized']);
          }
        });
    }

    getData(path: string){
        if(!this.dataService.getData("accessToken")){
            return;
        }
        let headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        headers.append('authorization', 'Bearer '+ this.dataService.getData("accessToken"));
        if (this.dataService.getData("CurrentCollectGroup"))
            headers.append('CollectGroupId', JSON.parse(this.dataService.getData("CurrentCollectGroup")).GUID);

        //do the http call
        return this.http
            .get(
                this.apiUrl + encodeURI(path),
                { headers }
            )
            .toPromise()
            .then(res => {
                try {
                    return res;
                } catch (e) {
                    return res["_body"];
                }
            }).catch(err =>  {
                if(err.status === 403 || err.status === 401){
                    this.router.navigate(['unauthorized']);
                }
            });
    }

    putData(path: string, body: any) {
        if(!this.dataService.getData("accessToken")){
            return;
        }
        let json = JSON.stringify(body);

        let headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        headers.append('authorization', 'Bearer '+ this.dataService.getData("accessToken"));
        if (this.dataService.getData("CurrentCollectGroup"))
            headers.append('CollectGroupId', JSON.parse(this.dataService.getData("CurrentCollectGroup")).GUID);

        //do the http call
        return this.http
            .put(this.apiUrl + encodeURI(path),json, {headers}).toPromise().then(res => {
                try {
                    return res;
                } catch (e) {
                    return res["_body"];
                }
            }).catch(err =>  {
                if(err.status === 403 || err.status === 401){
                    this.router.navigate(['unauthorized']);
                }
            });
    }
}
