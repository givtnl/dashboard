import { Component } from '@angular/core';

import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

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

    //Setting ready for mulitlingual
    error_message: string;
    email_placeholder: string = "Email adres";
    password_placeholder: string = "Wachtwoord";
    button_text: string = "inloggen";
    stayloggedin_text: string = "ingelogd blijven";

    constructor(private userService: UserService, private router: Router){
        this.passwordHidden = true;
        this.eyeColor = "#BCB9C9";
    }

    login(){
        this.error_message = "";
        if(!this.userName || !this.password){
            this.error_message = "Vul de velden in"; //multilingual
            return;
        }
        this.userService.login(this.userName, this.password, this.stay_loggedin)
            .then(resp => {
                this.router.navigate(['/dashboard']);
            },
                error => this.error_message = "Verkeerd wachtwoord of username, probeer opnieuw"//multilingual
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
