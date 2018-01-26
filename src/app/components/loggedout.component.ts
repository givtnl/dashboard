import { Component, ViewEncapsulation } from '@angular/core';

import {TranslateService} from 'ng2-translate';
import {DataService} from "../services/data.service";
import {UserService} from "../services/user.service";
import {Router} from "@angular/router";
import { setTimeout } from 'timers';
@Component({
    selector: 'loggedout',
    template: `
<span class="errormessage">{{message}}</span>

<button type="submit" (click)="logout()">Back to login</button>
`,
    styles: [`
.errormessage{
    font-family: Avenir_Medium;
    display: block;
    width: 500ps;
    text-align:center;
    color: red;
    margin: 50px auto;
}

button{
    margin: 0 auto;
    width: auto;
    display: block;
    background: #41C98E;
    border: 1px solid #41C98E;
    font-family: 'Avenir_Black';
    font-size: 1em;
    color: #FFFFFF;
    text-align: center;
    padding:10px;
}

`]
})
export class LoggedOutComponent  {
    message: string;

    constructor(private userService: UserService, private router:Router) {
        this.message = "Je bent uitgelogd wegens veiligheidsredenen. \n Je wordt dadelijk doorverwezen naar de loginpagina.";

        setTimeout(()=>{
            this.router.navigate(['']);
        },5000);

    }

}
