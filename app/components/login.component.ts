import { Component } from '@angular/core';

import { UserService } from '../Services/user.service';

@Component({
    selector: 'login',
    templateUrl: 'app/html/login.component.html',
    styleUrls: ['./app/css/login.component.css']
})
export class LoginComponent  {

    constructor(private userService: UserService){
        this.userService = userService;
    }

    login(){
        this.userService.login(this.userName, this.password)
            .then(data => {
                console.log(data);
            });
    }

}
