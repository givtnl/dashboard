import {WebApi} from './helpers/webapi';
import {EventAggregator} from 'aurelia-event-aggregator';
import {LoginEvent} from './helpers/messages';
import {UserManager} from './helpers/UserManager';

export class Login{
    static  inject(){ return [WebApi, EventAggregator, UserManager]};
    constructor(api, ea, userManager){
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
                if(document.getElementById("loginError")){
                    document.getElementById("loginError").innerHTML = "Verkeerd wachtwoord/gebruikersnaam, probeer opnieuw.";
                    return;
                }
                this.errorText = msg.error;
                var node = document.createElement("span");
                var textNode = document.createTextNode("Verkeerd wachtwoord/gebruikersnaam, probeer opnieuw.");
                node.appendChild(textNode);
                node.className = "error";
                node.id = "loginError";
                document.getElementById("login").appendChild(node);
            }
        }
    }


    login(){
        this.userManager.login(this.email, this.password);
        document.getElementById("loginError").innerHTML = "";
    }
}