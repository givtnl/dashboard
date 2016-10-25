import {WebApi} from './helpers/webapi';
import {EventAggregator} from 'aurelia-event-aggregator';
import {LoginEvent} from './helpers/messages';
import {CookieMonster} from './helpers/cookiemonster';

export class Login{
    static  inject(){ return [WebApi, EventAggregator, CookieMonster]};
    constructor(api, ea, cookieMonster){
        this.stayLoggedIn = "Blijf ingelogd";
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
        this.cookieMonster.createCookie("access_token", msg.access_token, msg.expires_in / 60 / 60 / 24);
        console.log(msg);
        location.reload();
    }


    login(){
        this.api.login(this.email, this.password);
    }
}