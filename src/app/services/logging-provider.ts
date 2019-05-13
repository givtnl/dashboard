import { Injectable } from "@angular/core";

@Injectable()
export class LoggingProvider {
    constructor() {
        console.log("LoggingProvider initialized")
    }  
}
  