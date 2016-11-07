import {WebApi} from './helpers/webapi';
import {EventAggregator} from 'aurelia-event-aggregator';
import {LoginEvent} from './helpers/messages';
import {CookieMonster} from './helpers/cookiemonster';
import {UserManager} from './helpers/UserManager';

export class Login{
    static  inject(){ return [WebApi, EventAggregator, CookieMonster, UserManager]};
    constructor(api, ea, cookieMonster, userManager){
        this.stayLoggedIn = "Blijf ingelogd";
        this.userManager = userManager;
        this.api = api;
        this.email = "debug@nfcollect.com";
        this.password = "Test123";
        this.staylogged = false;
        this.legit = false;
        this.ea = ea;
        this.cookieMonster = cookieMonster;

        ea.subscribe(LoginEvent, msg =>
        {
            this.loggedIn(msg.msg)
        });
    }

    loggedIn(msg){
        if(msg.access_token){
            this.cookieMonster.createCookie("access_token", msg.access_token, msg.expires_in / 60 / 60 / 24);
            location.reload();
        }
        else{
            if(msg.error){
                if(document.getElementById("loginError"))
                    document.getElementById("loginError").innerHTML = "";
                this.errorText = msg.error;
                var node = document.createElement("span");
                var textNode = document.createTextNode(this.errorText);
                node.appendChild(textNode);
                node.className = "error";
                node.id = "loginError";
                document.getElementById("login").appendChild(node);
            }
        }
    }


    login(){
        this.userManager.login(this.email, this.password);
    }
}