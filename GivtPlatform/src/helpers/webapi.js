import {EventAggregator} from 'aurelia-event-aggregator';
import {LoginEvent} from './messages';
import {CookieMonster} from './cookiemonster';

export class WebApi{
    static inject() {return [EventAggregator, CookieMonster]};

    constructor(ea, cookieMonster){
        this.ea = ea;
        this.cookieMonster = cookieMonster;
    };

    getSecure(url, params){
        var eventAggr = this.ea;
        var bearer = this.cookieMonster.getCookie("access_token");
        var oReq = new XMLHttpRequest();
        oReq.open("GET", "https://givtapidebug.azurewebsites.net/api/" + url);
        oReq.setRequestHeader("Content-type","text/plain");
        oReq.setRequestHeader("Authorization", "Bearer " + bearer);
        if(params){
            var params = JSON.parse(params);
            oReq.send(params);

        } else {
            oReq.send(null);

        }

        var temp = 0;
        return new Promise(function(resolve,reject){
            oReq.onreadystatechange = function() {
                if(oReq.readyState == 4 && oReq.status == 200) {
                    try{
                        temp = JSON.parse(oReq.responseText);
                        resolve(temp);
                    }
                    catch(err){
                        resolve(oReq.responseText);
                    }
                }
            }
        });





    }

    get(url, params) {
        var oReq = new XMLHttpRequest();
        oReq.open("POST", "https://givtapidebug.azurewebsites.net/api/" + url);
        oReq.setRequestHeader("Content-type","application/json");
        var params = JSON.parse(params);
        return {
            then : function(callback){
                callback(27);
            }
        }
        oReq.onreadystatechange = function() {
            if(oReq.readyState == 4 && oReq.status == 200) {
                return JSON.parse(oReq.responseText);
            }
        }
        oReq.send(params);
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
}