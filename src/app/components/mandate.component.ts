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
import { ApiClientService } from "app/services/api-client.service";



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
    selectedContact;
    contacts;
    SlimPayLink;
    CRMId : string;

    urlGetCompanies: string = "https://app.teamleader.eu/api/getCompanies.php?api_group=50213&amount=10&pageno=0&searchby=";
    urlContactsByCompany : string = "https://app.teamleader.eu/api/getContactsByCompany.php?api_group=50213&company_id=";
    urlContactById : string = "https://app.teamleader.eu/api/getContact.php?api_group=50213&contact_id=";

    constructor(
        private userService: UserService,
        private router: Router,
        translate: TranslateService,
        private route: ActivatedRoute,
        private http: Http,
        private apiClient: ApiClientService
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
        let headers = new Headers({'Content-Type':'application/json'});
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods','*');
        headers.append('Access-Control-Allow-Headers','Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type');
        let options = new RequestOptions({headers:headers});


        this.apiClient.getData("Admin/ThirdPartyToken?type=Teamleader")
            .then(data => {
                this.CRMId = data.Teamleader;
                console.log(this.CRMId);
                this.apiClient.postData("Admin/CorsTunnelGet", {url : this.urlGetCompanies + this.search + "&api_secret=" + this.CRMId,body : "{}", headers: {}})
                    .then(d => {
                        this.filteredOrganisations = d;
                        this.showFiltered = true;
                        this.searchBtn = "Zoeken";
                        this.disabled = false;
                    })
                    .catch(err => console.log(err));
            });

    }

    change()
    {
        if(!this.search){
            this.filteredOrganisations = [];
        }
    }

    select(i){
        this.selectedContact = null;
        console.log(i);
        this.searchBtn = "Laden...";
        this.disabled = true;

        this.selectedOrganisation = i;
        this.selectedOrganisation.contacts = [];
        this.search = "";
        this.change();

        this.apiClient.postData("Admin/CorsTunnelGet", {url: this.urlContactsByCompany + this.selectedOrganisation.id + "&api_secret=" + this.CRMId, body : "{}", headers: {}})
            .then(data => {
                this.selectedOrganisation.contacts = data;
                this.disabled = false;
                this.searchBtn = "Zoeken";

                for(let i = 0; i < this.selectedOrganisation.contacts.length; i++)
                {
                    this.apiClient.postData("Admin/CorsTunnelGet", {url: this.urlContactById + this.selectedOrganisation.contacts[i].id + "&api_secret=" + this.CRMId, body : "{}", headers: {}})
                        .then(d => {
                            console.log(d);
                            console.log(d.custom_fields['92267']);
                            if(d.custom_fields['92267'] == "1"){
                                console.log("hoera");
                                this.selectedContact = d;


                            } else {
                                console.log("geen heoera");
                            }

                        });
                }



            });
    }

    registerMandate(){
        if(!this.selectedOrganisation || !this.selectedContact){
            return;
        }
        let o = this.selectedOrganisation;
        let c = this.selectedContact;
        let mandate = {
            Mandate : {
                Signatory : {
                    email : o.email,
                    familyName : c.surname,
                    givenName : c.forename,
                    companyName: o.name,
                    telephone : c.telephone,
                    bankAccount : {
                        iban: o.iban
                    },
                    billingAddress : {
                        city : o.city,
                        country : o.country,
                        postalCode : o.zipcode,
                        street1 : o.street,
                        street2 : "", //empty
                    }

                }
            },
            CrmId : this.selectedOrganisation.id.toString()
        };

        this.apiClient.postData("Mandate/Org", mandate )
            .then(spl => {
                this.SlimPayLink = spl;
            })

    }

    registerOrganisation(){
        if(!this.SlimPayLink) return;
        console.log(this.SlimPayLink);
    }

}