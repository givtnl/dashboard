/**
 * Created by Lennie on 28/03/2017.
 */
import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {HttpModule, Http, Headers, RequestOptions} from '@angular/http';
import { UserService } from 'app/services/user.service';
import {Router, ActivatedRoute} from '@angular/router';
import {TranslateService} from 'ng2-translate';
import { CompleterService, CompleterData } from 'ng2-completer';
import {Organisation} from "../models/organisation";


@Component({
    selector: 'mandate',
    templateUrl: '../html/mandate.component.html',
    styleUrls: ['../css/mandate.component.css']
})

export class MandateComponent implements OnInit{
    ngOnInit(): void {

    }

    showFiltered: boolean = false;
    search: string = "";

    title: string = "Regeel mandaat voor een organisatie";
    subtitle: string = "Zoek een organisatie bij naam om een mandaat te regelen.";
    searchBtn: string = "Zoeken";
    disabled: boolean = false;

    organisations: Organisation[] = new Array();
    filteredOrganisations;
    selectedOrganisation;


    apiUrl: string = "https://app.teamleader.eu/api/getCompanies.php?api_group=50213&api_secret=xD0PjX72gIzSUtj02BFIoTVtNOTT1Tdpm44wS2pZAOHk8Rb1iGzxqlR4ZANRjR6wL1TtT8ikNQuLxwCG323jdLe3bRKlyGHaxqthoCr1jMDG86c2Y6b2HgVJXwUm3smqJGyX9PPisjOrfRj3NlWlrHUf4FrXXEewbCkah0iA9XReF08ibUussexmKPaxkeTlG4lOUueU&amount=10&pageno=0&searchby=";
    apiUrl2 : string = "https://app.teamleader.eu/api/getContactsByCompany.php?api_group=50213&api_secret=xD0PjX72gIzSUtj02BFIoTVtNOTT1Tdpm44wS2pZAOHk8Rb1iGzxqlR4ZANRjR6wL1TtT8ikNQuLxwCG323jdLe3bRKlyGHaxqthoCr1jMDG86c2Y6b2HgVJXwUm3smqJGyX9PPisjOrfRj3NlWlrHUf4FrXXEewbCkah0iA9XReF08ibUussexmKPaxkeTlG4lOUueU&company_id=";
    constructor(
        private userService: UserService,
        private router: Router,
        translate: TranslateService,
        private route: ActivatedRoute,
        private http: Http
    )
    {
        for(let i = 0; i <5; i++)
        {
            let x = new Organisation();
            x.name = "Testkerk " + i;
            this.organisations.push(x);
        }
    }

    searchOrg(){
        /*
        this.filteredOrganisations = [];
        this.organisations.forEach(x => {
            if(x.name.includes(this.search))
            {
                this.filteredOrganisations.push(x);
            }
        });
        console.log(this.filteredOrganisations);
    */
        this.disabled = true;
        this.searchBtn = "Laden...";
        console.log("hello");
        let headers = new Headers({'Content-Type':'application/json'});
        let options = new RequestOptions({headers:headers});
        this.http.post(this.apiUrl + this.search, null, options)
            .toPromise()
            .then(data => {
                this.filteredOrganisations = JSON.parse(data._body);
                this.showFiltered = true;
                this.searchBtn = "Zoeken";
                this.disabled = false;
            })
            .catch(err => console.log(err));

    }

    change()
    {
        if(!this.search){
            this.filteredOrganisations = [];
        }
    }

    select(i){
        console.log(i);
        this.searchBtn = "Laden...";
        this.disabled = true;

        this.selectedOrganisation = i;
        this.selectedOrganisation.contacts = [];
        this.search = "";
        this.change();
        let headers = new Headers({'Content-Type':'application/json'});
        let options = new RequestOptions({headers:headers});
        this.http.post(this.apiUrl2 + this.selectedOrganisation.id, null, options)
            .toPromise()
            .then(data => {
                console.log(JSON.parse(data._body));
                let contacts = JSON.parse(data._body);
                this.selectedOrganisation.contacts = contacts;
                this.disabled = false;
                this.searchBtn = "Zoeken";
            })
    }

}