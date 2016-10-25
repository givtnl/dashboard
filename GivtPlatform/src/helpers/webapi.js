import {EventAggregator} from 'aurelia-event-aggregator';
import {LoginEvent} from './messages';

export class WebApi{
    static inject() {return [EventAggregator]};

    constructor(ea){
        //this.url = url;
        this.ea = ea;
    };

    get(url, params) {
        var oReq = new XMLHttpRequest();
        oReq.open("POST", "https://givtapidebug.azurewebsites.net/api/" + url);
        oReq.setRequestHeader("Content-type","application/json");
        var params = JSON.parse(params);
        oReq.onreadystatechange = function() {//Call a function when the state changes.
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
                return this.statusText;
            }
        }
    }
}