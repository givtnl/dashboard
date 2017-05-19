import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserService } from 'app/services/user.service';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private userService: UserService, private router: Router) {}

    canActivate() {
        if(this.userService.roles === undefined)
            return false;
        if(this.userService.roles){
            let x = JSON.parse(this.userService.roles);
            if(x.indexOf("Admin") > -1){
                return true;
            } else {
                this.router.navigate(['dashboard']);
                return false;
            }

        }else{
            this.router.navigate(['dashboard']);
            return false;
        }
    }
}
