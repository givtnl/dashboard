import { Component } from '@angular/core';

import { UserService } from '../Services/user.service';

@Component({
    selector: 'login',
    templateUrl: 'app/html/login.component.html',
    styleUrls: ['./app/css/login.component.css']
})
export class LoginComponent  {

    passwordHidden: boolean;
    eyeColor:string;

    constructor(private userService: UserService){
        this.userService = userService;
        this.passwordHidden = true;
        this.eyeColor = "#2E2957"
    }

    login(){
        this.error_message = "";
        if(!this.userName || !this.password){
            this.error_message = "Vul de velden in";
            return;
        }
        this.userService.login(this.userName, this.password)
            .then(resp => {
                if(resp){
                    console.log("logged in!");
                }
            },
                error => this.error_message = "Verkeerd wachtwoord, probeer opnieuw"
            );
    }

    showPass(){
        if(this.passwordHidden){
            this.passwordHidden = false;
            document.getElementById("")
            console.log("aight");
        }else{
            this.passwordHidden = true;
            console.log("nope");
        }
    }
}
