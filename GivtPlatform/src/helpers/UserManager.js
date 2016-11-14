import {EventAggregator} from 'aurelia-event-aggregator';
import {LoginEvent} from './messages';
import {Router} from 'aurelia-router';

export class UserManager{
    static inject() {return [EventAggregator, Router]};

    constructor(ea, router){
        this.ea = ea;
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
        }.bind(this);
    }

    logOut(){
        console.log("logged out now");
        localStorage.clear();
        sessionStorage.clear();
        this.myRouter.navigate("");
        location.reload();
    }
}