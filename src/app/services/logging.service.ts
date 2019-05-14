import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { DataService } from "./data.service";
import * as pkg from '../../../package.json';
import { Http, Headers } from "@angular/http";
import { ApiClientService } from "./api-client.service";

@Injectable()
export class LoggingService {
    private logitUrl = "https://api.logit.io/v2"
    private static logstashApiKey: string = "";

    constructor(private dataService: DataService, private http: Http, private apiClient: ApiClientService) {
        apiClient.getData("v2/keys/logstash")
            .then(resp => {
                LoggingService.logstashApiKey = resp.LogstashApiKey
            })
            .catch(err => {
                console.log(err)
            })
    }
    log(level: LogLevel, message: string){
        let headers = new Headers();
        headers.append('ApiKey', LoggingService.logstashApiKey);
        headers.append('Content-Type', 'application/json')
        
        let body = new LogitBody()
        body.level = LogLevel[level]
        body.version = pkg["version"]
        body.browser = navigator.userAgent
        body.lang = navigator.language
        if (this.dataService.getData("CurrentCollectGroup"))
            body.guid = JSON.parse(this.dataService.getData("CurrentCollectGroup")).GUID
        
        if(environment.production){
            body.tag = "GivtDashboard.Production"
        } else {
            body.tag = "GivtDashboard.Debug"
        }
        body.message = message

        const json = JSON.stringify(body)
        return this.http
            .put(this.logitUrl, json, { headers })
            .toPromise()
    }
}

class LogitBody {
    message: string
    tag: string
    version: string
    guid: string
    lang: string
    browser: string
    level: string
}
export enum LogLevel {
    Information,
    Warning,
    Error
}