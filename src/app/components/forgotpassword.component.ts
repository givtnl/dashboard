import {Component, OnInit} from '@angular/core';
import { UserService } from 'app/services/user.service';
import {Router, ActivatedRoute} from '@angular/router';
import {TranslateService} from 'ng2-translate';

@Component({
    selector: 'forgotpassword',
    templateUrl: '../html/forgotpassword.component.html',
    styleUrls: ['../css/forgotpassword.component.css']
})
export class ForgotPasswordComponent  implements OnInit{
    passwordHidden: boolean;
    eyeColor: string;
    userName: string;
    password: string;
    stay_loggedin: boolean;
    error_message: string;
    email_given: boolean = false;
    saved : boolean = false;
    no_email_given : boolean = false;
    email : string;


    translate: TranslateService;
    constructor(private userService: UserService, private router: Router, translate:TranslateService, private route : ActivatedRoute){
        this.userService = userService;
        this.passwordHidden = true;
        this.eyeColor = "#BCB9C9";
        this.translate = translate;
    }

    ngOnInit(){
        console.log("i'm initialized.");
        this.route
            .queryParams
            .subscribe(params => {
                console.log(params);
                if(params.email){
                    this.email_given = true;
                    this.email = params.email;
                }else{
                    this.no_email_given = true;
                }
                this.queryParams = params;
            });
    }

    requestPass(){
        this.error_message = "";
        if(!this.userName || !this.password){
            this.translate.get("Error_FillAllFieldsIn").subscribe(value => {this.error_message = value;});
            return;
        }else{
            this.email_given = false;
            this.saved = true;
        }
        /*this.userService.login(this.userName, this.password, this.stay_loggedin)
            .then(resp => {
                    this.router.navigate(['/dashboard']);
                },
                error => this.translate.get("Error_WrongEmailOrPassword").subscribe(value => {this.error_message = value;})
            );*/
    }

    save(){
        this.saved = true;
        this.email_given = false;
        this.no_email_given = false;
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

