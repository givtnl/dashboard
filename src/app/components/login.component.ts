import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from "ng2-translate";
import { UserService } from "../services/user.service";
import { DataService } from 'app/services/data.service';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/switchMap';

@Component({
    selector: 'login',
    templateUrl: '../html/login.component.html',
    styleUrls: ['../css/login.component.css']
})
export class LoginComponent implements OnInit {
    passwordHidden: boolean;
    eyeColor: string;
    userName: string;
    password: string;
    error_message: string;
    ShowLoadingAnimation: boolean = false;

    constructor(private userService: UserService, private router: Router, private translate: TranslateService, private dataService: DataService, private activatedRoute: ActivatedRoute) {
        this.passwordHidden = true;
        this.eyeColor = "#BCB9C9";
    }

    ngOnInit() {
        var access_token = this.activatedRoute.snapshot.queryParams.access_token;
        var refresh_token = this.activatedRoute.snapshot.queryParams.refresh_token;
        if (access_token !== null && refresh_token !== null) {
            this.ShowLoadingAnimation = true;
            this.userService.loginWithRefreshtoken(access_token, refresh_token).then((result) => result ? this.router.navigate(['/dashboard']) : this.ShowLoadingAnimation = false).catch((result) => this.ShowLoadingAnimation = false);
        }

        let is_safari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        if (is_safari) {
            document.getElementById("pass-eye").addEventListener("mousedown", (event) => {
                let hasFocus = $('#pass').is(':focus');
                if (hasFocus) {
                    event.preventDefault(); //prevent dismissal of keyboard
                };
            });
        } else {
            $('#pass-eye').click((event) => {
                event.preventDefault(); //prevent dismissal of keyboard
                $('#pass').focus();
            });
        }
    }

    updateUserExtensionIfRequired(): void {
        const currentLanguage = this.translate.getBrowserLang();
        // get the current user
        this.userService.getCurrentUser()
            .switchMap(result => result.AppLanguage && result.AppLanguage.length > 0 ? of({}) : this.userService.patchLanguage(result.GUID, currentLanguage))
            .subscribe();
    }
    login() {
        this.error_message = "";
        if (!this.userName || !this.password) {
            this.translate.get("Error_FillAllFieldsIn").subscribe(value => { this.error_message = value; });
            return;
        }
        this.ShowLoadingAnimation = true;
        this.userService.login(this.userName, this.password)
            .then(resp => {
                this.ShowLoadingAnimation = false;
                if (resp) {
                    if (this.userService.GivtOperations)
                        this.router.navigate(['/mandate']);
                    else {
                        this.updateUserExtensionIfRequired();
                        this.router.navigate(['/dashboard']);
                    }
                } else {
                    this.router.navigate(['/unauthorized']);
                }
            },
                error => {
                    this.ShowLoadingAnimation = false;
                    if (JSON.parse(error._body).error_description == "LockedOut") {
                        this.translate.get("Error_LockedOut")
                            .subscribe(value => { this.error_message = value; })
                    } else {
                        this.translate.get("Error_WrongEmailOrPassword")
                            .subscribe(value => { this.error_message = value; })
                    }
                }
            );
    }

    showPass() {
        if (this.passwordHidden) {
            this.passwordHidden = false;
            (<HTMLInputElement>document.getElementById("pass")).type = "text";
            this.eyeColor = "#41C98E";
        } else {
            this.passwordHidden = true;
            (<HTMLInputElement>document.getElementById("pass")).type = "password";
            this.eyeColor = "#BCB9C9";
        }
    }

    forgotPW() {
        this.router.navigate(['/forgotpassword'], { queryParams: { e: this.userName } });
    }
}
