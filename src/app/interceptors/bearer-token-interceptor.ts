

import { Observable } from "rxjs";
import { DataService } from "app/services/data.service";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class BearerTokenInterceptor   implements HttpInterceptor {
        constructor(public dataService: DataService) {}
        intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
          
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${this.dataService.getData('accessToken')}`
            }
          });
          return next.handle(request);
        } 
}