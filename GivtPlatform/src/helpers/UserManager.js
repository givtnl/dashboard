import {EventAggregator} from 'aurelia-event-aggregator';
import {LoginEvent} from './messages';
import {CookieMonster} from './cookiemonster';
import {Router} from 'aurelia-router';

export class UserManager{
    static inject() {return [EventAggregator, CookieMonster, Router]};

    constructor(ea, cookieMonster, router){
        this.ea = ea;
        this.cookieMonster = cookieMonster;
        this.myRouter = router;
    }


    login(email, password){
        var oReq = new XMLHttpRequest();
        var eventAggr = this.ea;
        oReq.open("POST", "https://givtapidebug.azurewebsites.net/oauth2/token");
        oReq.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        var params = "grant_type=password&userName="+email+"&password="+password;
        oReq.send(params);
        oReq.onload = function() {
            if(oReq.status >= 200 && oReq.status <300) {
                var json = oReq.responseText;
                if(json != ""){
                    eventAggr.publish(new LoginEvent(JSON.parse(json)));
                }
            } else{
                var json = oReq.responseText;
                if(json != ""){
                    eventAggr.publish(new LoginEvent(JSON.parse(json)));
                }
            }
        }
    }

    logOut(){
        console.log("logged out now");
        this.cookieMonster.delete_cookie("access_token");
        this.myRouter.navigate("");
        location.reload();
    }
}