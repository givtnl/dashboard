import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable()
export class LoginComponentGuard implements CanActivate {
    constructor(private userService: UserService, private router: Router) {}

    canActivate(route: ActivatedRouteSnapshot) {
        if (this.userService.loggedIn && route.queryParams.access_token == null) {
            this.router.navigate(['dashboard']);
            return false;
        }

        return true;
    }
}
