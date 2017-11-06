import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserService } from 'app/services/user.service';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private userService: UserService, private router: Router) {}

    canActivate() {
        if(this.userService.SiteAdmin)
           return true;

        this.router.navigate(['dashboard']);
        return false;
    }
}
