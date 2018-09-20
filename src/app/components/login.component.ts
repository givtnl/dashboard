import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {TranslateService} from "ng2-translate";
import {UserService} from "../services/user.service";

@Component({
    selector: 'login',
    templateUrl: '../html/login.component.html',
    styleUrls: ['../css/login.component.css']
})
export class LoginComponent  {
    passwordHidden: boolean;
    eyeColor: string;
    userName: string;
    password: string;
    error_message: string;
	ShowLoadingAnimation: boolean = false;

    constructor(private userService: UserService, private router: Router, private translate:TranslateService){
        this.passwordHidden = true;
        this.eyeColor = "#BCB9C9";
    }

    login(){
        this.error_message = "";
        if(!this.userName || !this.password){
            this.translate.get("Error_FillAllFieldsIn").subscribe(value => {this.error_message = value;});
            return;
        }
	    this.ShowLoadingAnimation = true;
        this.userService.login(this.userName, this.password)
            .then(resp => {
            	this.ShowLoadingAnimation = false;
                if (resp) {
                    if (this.userService.GivtOperations)
                        this.router.navigate(['/mandate']);
                    else
                        this.router.navigate(['/dashboard']);
                } else {
                    this.router.navigate(['/unauthorized']);
                }
            },
            error => {
            	this.ShowLoadingAnimation = false;
                if(JSON.parse(error._body).error_description == "LockedOut")
                {
                    this.translate.get("Error_LockedOut")
                        .subscribe(value => {this.error_message = value;})
                }else
                {
                    this.translate.get("Error_WrongEmailOrPassword")
                        .subscribe(value => {this.error_message = value;})
                }
            }
            );
    }

    showPass(){
        if(this.passwordHidden){
            this.passwordHidden = false;
            (<HTMLInputElement>document.getElementById("pass")).type = "text";
            this.eyeColor = "#41C98E";
        }else{
            this.passwordHidden = true;
            (<HTMLInputElement>document.getElementById("pass")).type = "password";
            this.eyeColor = "#BCB9C9";
        }
    }

    forgotPW()
    {
        this.router.navigate(['/forgotpassword'],  { queryParams: { e: this.userName }});
    }
}
