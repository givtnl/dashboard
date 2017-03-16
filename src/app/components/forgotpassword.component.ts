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

    /*  booleans for flow  */
    email_given: boolean = false;
    saved : boolean = false;
    no_email_given : boolean = false;
    wrong: boolean = false;
    /*  ------  */

    email: string;
    token: string;


    translate: TranslateService;
    constructor(private userService: UserService, private router: Router, translate:TranslateService, private route : ActivatedRoute){
        this.userService = userService;
        this.passwordHidden = true;
        this.eyeColor = "#BCB9C9";
        this.translate = translate;
    }

    ngOnInit(){
        this.route
            .queryParams
            .subscribe(params => {
                if(params.email){
                    this.email_given = true;
                    this.email = params.email;
                }else{
                    this.no_email_given = true;
                }
                if(params.code){
                    this.token = params.code;
                }
                this.queryParams = params;
            });
    }

    requestPass(){
        this.userService.requestNewPass(this.userName)
            .then(resp => {
                if(resp.ok == true)
                {
                    this.saved = false;
                    this.email_given = false;
                    this.no_email_given = false;
                    this.wrong = true;
                    this.error_message = "Uw nieuw wachtwoord werd aangevraagd.";
                }
            });
    }

    save(){
        this.error_message = null;
        this.userService.saveNewPass(this.email, this.token, this.password)
            .then(res => {
                if(res.ok)
                {
                    console.log(res);
                    this.saved = true;
                    this.email_given = false;
                    this.no_email_given = false;
                }else{
                    this.saved = false;
                    this.email_given = false;
                    this.no_email_given = false;
                    this.wrong = true;
                }
            })
            .catch(err =>{
                this.saved = false;
                this.email_given = false;
                this.no_email_given = false;
                this.wrong = true;
                this.error_message = err._body;
                console.log(err);
            })
    }

    retry(){
        this.wrong = false;
        this.route
            .queryParams
            .subscribe(params => {
                if(params.email){
                    this.email_given = true;
                    this.email = params.email;
                }else{
                    this.no_email_given = true;
                }
                if(params.code){
                    this.token = params.code;
                }
                this.queryParams = params;
            });
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

