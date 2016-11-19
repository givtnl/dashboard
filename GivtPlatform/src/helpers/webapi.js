import {EventAggregator} from 'aurelia-event-aggregator';
import env from '../environment';
import {LogoutEvent} from './messages';

export class WebApi{
    static inject() {return [EventAggregator, env]};

    constructor(ea, env){
        this.ea = ea;
        this.env = env;
    };

    getSecure(url, params){
        var eventAggr = this.ea;
        if(localStorage.access_token)
            var bearer = localStorage.access_token;
        if(sessionStorage.access_token)
            var bearer = sessionStorage.access_token;
        var oReq = new XMLHttpRequest();
        oReq.open("GET", env.apiLink + "api/" + url);
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
                else{
                    if(oReq.status == 401){
                        eventAggr.publish(new LogoutEvent("Bearer not valid"));
                    }
                }
            }
        });
    }
}