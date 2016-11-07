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
}