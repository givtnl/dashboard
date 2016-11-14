import {EventAggregator} from 'aurelia-event-aggregator';
import {LoginEvent} from './messages';

export class WebApi{
    static inject() {return [EventAggregator]};

    constructor(ea, cookieMonster){
        this.ea = ea;
        this.cookieMonster = cookieMonster;
    };

    getSecure(url, params){
        var eventAggr = this.ea;
        if(localStorage.access_token)
            var bearer = localStorage.access_token;
        if(sessionStorage.access_token)
            var bearer = sessionStorage.access_token;
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