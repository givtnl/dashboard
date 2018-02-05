import { Component } from '@angular/core';

import {UserService} from "../services/user.service";
import {Router} from "@angular/router";
@Component({
    selector: 'loggedout',
    template: `
      <div class="errormessage">
        <h1 style="font-family: Avenir_Heavy">{{ "SessionExpiredTitle" | translate}}</h1>
        <span style="font-family: Avenir_Light">{{ "SessionExpiredMessage" | translate}}</span>
        <button type="submit" (click)="relogin()">{{ "Relog" | translate }} ({{ this.secondsLeft }})</button>
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
  border:0;
}
      
      button:hover{
        opacity: 1.0;
      }

`]
})
export class LoggedOutComponent  {
    secondsLeft: number = 3;

    constructor(private router:Router) {
        this.secondsLeft = 3;
        let timer = setInterval(() => {
          this.secondsLeft--;
          if(this.secondsLeft <= 0) {
            clearInterval(timer);
            this.router.navigate(['']);
          }
        }, 1000);

    }

    relogin(){
      this.router.navigate(['']);
    }
}
