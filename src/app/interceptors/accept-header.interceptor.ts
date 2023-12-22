

import { Observable } from "rxjs";
import { DataService } from "../services/data.service";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class AcceptHeaderInterceptor   implements HttpInterceptor {
       
        intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
          
          request = request.clone({
            setHeaders: {
              Accept: `application/json`
            }
          });
          return next.handle(request);
        } 
}