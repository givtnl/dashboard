import {WebApi} from './helpers/webapi';
import {EventAggregator} from 'aurelia-event-aggregator';
import {LoginEvent} from './helpers/messages';
import {UserManager} from './helpers/UserManager';
import {I18N} from 'aurelia-i18n';


export class Login{
    static  inject(){ return [WebApi, EventAggregator, UserManager,I18N]};
    constructor(api, ea, userManager,I18N){
        this.i18n = I18N;
        this.i18n.setLocale(navigator.language);

        this.stayLoggedIn = "Blijf ingelogd";
        this.userManager = userManager;
        this.api = api;
        this.staylogged = false;
        this.legit = false;
        this.ea = ea;

        ea.subscribe(LoginEvent, msg =>
        {
            this.loggedIn(msg.msg)
        });
    }

    loggedIn(msg){
        if(msg.access_token){
            if(this.staylogged){
                localStorage.access_token = msg.access_token;
            }else{
                sessionStorage.access_token = msg.access_token;
            }
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