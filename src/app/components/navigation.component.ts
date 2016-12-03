import { Component } from '@angular/core';

import { UserService } from 'app/services/user.service';
import {Router} from "@angular/router";

@Component({
    selector: 'my-navigation',
    templateUrl: '../html/navigation.component.html',
    styleUrls: ['../css/navigation.component.css']
})
export class NavigationComponent  {
    instance_title: string;

    //multilingual
    logout_text: string = "uitloggen";

    constructor(private userService: UserService, private router: Router){
        this.instance_title = "Demo kerk";
    }

    logout(){
        this.userService.logout();
        this.router.navigate(['']);
    }
}
