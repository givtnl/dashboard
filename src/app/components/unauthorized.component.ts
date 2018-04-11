import { Component } from '@angular/core';

import {UserService} from "../services/user.service";
import {Router} from "@angular/router";

@Component({
    selector: 'unauthorized',
    template: `
<span class="errormessage">{{message}}</span>

<button type="submit" (click)="logout()">Back to login</button>
`,
    styles: [`
.errormessage{
    font-family: Avenir_Medium;
    display: block;
    width: 300px;
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
export class UnAuthorizeComponent  {
    message: string;

    constructor(private userService: UserService, private router:Router) {
        this.message = "You are unauthorized to view the page."
    }

    logout(){
        this.userService.logout();
        this.router.navigate(['']);
    }
}
