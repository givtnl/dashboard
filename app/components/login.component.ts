import { Component } from '@angular/core';
import { UserService } from '../Services/user.service';
import { Router } from '@angular/router';
import {TranslateService} from 'ng2-translate';

@Component({
    selector: 'login',
    templateUrl: 'app/html/login.component.html',
    styleUrls: ['./app/css/login.component.css']
})
export class LoginComponent  {
    passwordHidden: boolean;
    eyeColor: string;
    userName: string;
    password: string;
    stay_loggedin: boolean;
    error_message: string;

    translate: TranslateService;
    constructor(private userService: UserService, private router: Router, translate:TranslateService){
        this.userService = userService;
        this.passwordHidden = true;
        this.eyeColor = "#BCB9C9";
        this.translate = translate;

    }

    login(){
        this.error_message = "";
        if(!this.userName || !this.password){
            this.translate.get("Error_FillAllFieldsIn").subscribe(value => {this.error_message = value;})
            return;
        }
        this.userService.login(this.userName, this.password, this.stay_loggedin)
            .then(resp => {
                this.router.navigate(['/dashboard']);
            },
                error => this.translate.get("Error_WrongEmailOrPassword").subscribe(value => {this.error_message = value;})
            );
    }

    showPass(){
        if(this.passwordHidden){
            this.passwordHidden = false;
            document.getElementById("pass").type = "text";
            this.eyeColor = "#41C98E";
        }else{
            this.passwordHidden = true;
            document.getElementById("pass").type = "password";
            this.eyeColor = "#BCB9C9";
        }
    }
}
