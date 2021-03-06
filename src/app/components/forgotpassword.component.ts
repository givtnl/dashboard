/**
 * @param params.email
 * @param params.code
 * @param params.e
 * @param params.app
 */
import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { UserService } from 'app/services/user.service';
import {Router, ActivatedRoute} from '@angular/router';
import {TranslateService} from 'ng2-translate';

declare var params: any;

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
  email_sent: boolean = false;
  coming_from_app: boolean = false;
  queryParams: any;
  /*  ------  */

  disabled : boolean = false;
  shouldDisableSaveButton: boolean = true;
  email: string;
  token: string;

  mobile: boolean;


  translate: TranslateService;
  constructor(private userService: UserService, private router: Router, translate:TranslateService, private route : ActivatedRoute){
    this.userService = userService;
    this.passwordHidden = true;
    this.eyeColor = "#BCB9C9";
    this.translate = translate;
  }

  ngOnInit(){
    this.mobile =  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.resetNav();
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
        if(params.e){
          this.userName = params.e;
        }
        if(params.app){
          this.coming_from_app = (params.app === "true");
        }
        this.queryParams = params;
      });
  }

  requestPass(){
    this.disabled = true;
    if(!this.userName)
    {
      this.disabled = false;
      return;
    }
    this.userService.requestNewPass(this.userName)
      .then(resp => {
        this.disabled = false;
        if(resp.ok == true)
        {
          this.resetNav();
          this.email_sent = true;
          this.translate.get('PW_RequestedPW').subscribe((res: string) => {
            this.error_message = res;
          });
        }
      })
        .catch(resp => {
            this.resetNav();
            this.disabled = false;
            this.wrong = true;
            this.translate.get('PW_UnknownEmail').subscribe((res: string) => {
                this.error_message = res;
            });
        });
  }
  changePw(value) {
    var regEx = new RegExp(".*[0-9]+.*[A-Z]+.*|.*[A-Z]+.*[0-9]+.*");
    if(regEx.test(value) && value.length > 6 && value.length <= 35) {
      this.shouldDisableSaveButton = false
    } else {
      this.shouldDisableSaveButton = true
    }
  }
  save(){
    this.disabled = true;
    this.error_message = null;
    this.userService.saveNewPass(this.email, this.token, this.password)
      .then(res => {
        this.disabled = false;
        this.resetNav();
        if(res.ok)
        {
          this.saved = true;
        }else{
          this.wrong = true;
        }
      })
      .catch(err =>{
        this.disabled = false;
        this.resetNav();
        this.wrong = true;
        if(err._body.indexOf('Invalid') != -1) {
          this.translate.get('InvalidToken').subscribe((res: string) => {
            this.error_message = res;
          });
        } else {
          this.translate.get('PW_PWPolicy').subscribe((res: string) => {
            this.error_message = res;
          });
        }

        console.log(err);
      })
  }

  retry(){
    this.wrong = false;
    this.route
      .queryParams
      .subscribe(params => {
        this.resetNav();
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
      (<HTMLInputElement>document.getElementById("pass")).type = "text";
      this.eyeColor = "#41C98E";
    }else{
      this.passwordHidden = true;
      (<HTMLInputElement>document.getElementById("pass")).type = "password";
      this.eyeColor = "#BCB9C9";
    }
  }

  resetNav(){
    this.saved = false;
    this.email_given = false;
    this.no_email_given = false;
    this.wrong = false;
    this.email_sent = false;
  }
}

