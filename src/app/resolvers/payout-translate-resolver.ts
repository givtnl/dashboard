import { TranslateService } from "ng2-translate";
import { Injectable } from "@angular/core";
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { UserService } from "app/services/user.service";

@Injectable()
export class PayoutTranslateResolver implements Resolve<string> {
    constructor(private service: TranslateService, private userService: UserService) { }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> | Promise<any> | any {
        const currency = this.userService.currencySymbol;
        return this.service.get('Payout_NoPayouts', {
            0: currency
        });
    }
}