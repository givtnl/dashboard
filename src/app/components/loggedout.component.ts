import { Component, ViewEncapsulation } from '@angular/core';

import {TranslateService} from 'ng2-translate';
import {DataService} from "../services/data.service";
import {UserService} from "../services/user.service";
import {Router} from "@angular/router";
import { setTimeout } from 'timers';
@Component({
    selector: 'loggedout',
    template: `
      <div class="errormessage">
        <h1 style="font-family: Avenir_Heavy">{{ "SessionExpiredTitle" | translate}}</h1>
        <span style="font-family: Avenir_Light" >{{ "SessionExpiredMessage" | translate}}</span>
        <button type="submit" (click)="logout()">{{ "Relog" | translate }} ({{ this.secondsLeft }})</button>
      </div>
     


`,
    styles: [`
.errormessage{
    font-family: Avenir_Medium;
    display: block;
    width: 350px;
    color: #2C2B57;
    margin: 50px auto;
}

button{
    margin-top: 20px;
    margin-left: auto;
    width: auto;
    display: block;
    background: #2C2B57;
    opacity: 0.8;
    font-family: 'Avenir_Medium';
    font-size: 18px;
    color: #FFFFFF;
    text-align: center;
    padding:10px;
  cursor:pointer;
}
      
      button:hover{
        opacity: 1.0;
      }

`]
})
export class LoggedOutComponent  {
    message: string;
    secondsLeft: number = 3;

    constructor(private userService: UserService, private router:Router) {
        this.message = "Je bent uitgelogd wegens veiligheidsredenen. \n Je wordt dadelijk doorverwezen naar de loginpagina.";

        this.secondsLeft = 3;
        var timer = setInterval(() => {
          --this.secondsLeft;
          if(this.secondsLeft <= 0) {
            this.router.navigate(['']);
          }
        }, 1000);

    }

}
