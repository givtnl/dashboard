import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { DataService } from "./data.service";
import * as pkg from '../../../package.json';
import { Http, Headers } from "@angular/http";

@Injectable()
export class LoggingService {
    private logitUrl = "https://api.logit.io/v2"

    constructor(private dataService: DataService, private http: Http) {
        
    }
    private log(level: LogLevel, message: string){
        let headers = new Headers();
        headers.append('ApiKey', environment.logstashApiKey);
        headers.append('Content-Type', 'application/json')
        
        let body = new LogitBody()
        body.level = LogLevel[level]
        body.version = pkg["version"]
        body.browser = navigator.userAgent
        body.lang = navigator.language
        if (this.dataService.getData("CurrentCollectGroup"))
            body.guid = JSON.parse(this.dataService.getData("CurrentCollectGroup")).GUID
        body.tag = environment.logstashTag;
        body.message = message

        const json = JSON.stringify(body)
        return this.http
            .put(this.logitUrl, json, { headers })
            .toPromise()
    }

    error(message: string) {
        this.log(LogLevel.Error, message)
    }

    info(message: string) {
        this.log(LogLevel.Information, message)
    }

    warning(message: string) {
        this.log(LogLevel.Warning, message)
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