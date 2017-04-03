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

    title: string = "Regel mandaat voor een organisatie";
    subtitle: string = "Zoek een organisatie bij naam om een mandaat te regelen.";
    searchBtn: string = "Zoeken";
    disabled: boolean = false;

    filteredOrganisations;
    selectedOrganisation;
    selectedContact;
    contacts;
    SlimPayLink;
    CRMKey : string;

    urlGetCompanies: string = "https://app.teamleader.eu/api/getCompanies.php?api_group=50213&amount=10&selected_customfields=92583,93168&pageno=0&searchby=";
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
    }

    searchOrg(){
        this.disabled = true;
        this.searchBtn = "Laden...";
        let headers = new Headers({'Content-Type':'application/json'});
        headers.append('Access-Control-Allow-Origin', '*');
        headers.append('Access-Control-Allow-Methods','*');
        headers.append('Access-Control-Allow-Headers','Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type');
        let options = new RequestOptions({headers:headers});


        this.apiClient.getData("Admin/ThirdPartyToken?type=Teamleader")
            .then(data => {
                this.CRMKey = data.Teamleader;

                this.apiClient.postData("Admin/CorsTunnelGet", {url : this.urlGetCompanies + this.search + "&api_secret=" + this.CRMKey,body : "{}", headers: {}})
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
        this.selectedOrganisation.mandate_status = "";
        this.search = "";
        this.change();

        this.apiClient.getData("Mandate/Org/" + this.selectedOrganisation.id)
            .then(res => {
                console.log("crm mandaat status");
                console.log(res);
                this.selectedOrganisation.mandate_status = res;
            });

        this.apiClient.postData("Admin/CorsTunnelGet", {url: this.urlContactsByCompany + this.selectedOrganisation.id + "&api_secret=" + this.CRMKey, body : "{}", headers: {}})
            .then(data => {
                this.selectedOrganisation.contacts = data;
                this.disabled = false;
                this.searchBtn = "Zoeken";

                for(let i = 0; i < this.selectedOrganisation.contacts.length; i++)
                {
                    this.apiClient.postData("Admin/CorsTunnelGet", {url: this.urlContactById + this.selectedOrganisation.contacts[i].id + "&api_secret=" + this.CRMKey, body : "{}", headers: {}})
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
                    //telephone : c.telephone,
                    telephone : "+31612345678",
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
        console.log(JSON.stringify(mandate));
        this.apiClient.postData("Mandate/Org", mandate )
            .then(spl => {
                this.SlimPayLink = spl;
                this.sendMandateMail();
            })

    }

    sendMandateMail(){
        if(!this.SlimPayLink) return;
        if(!this.selectedOrganisation || !this.selectedContact ) return;
        if(!this.selectedOrganisation.cf_value_92583) return;
        console.log(this.SlimPayLink);

        let o = this.selectedOrganisation;
        let c = this.selectedContact;
        console.log(o);
        console.log(c);
        let email = {
            Email : "lenniestockman@hotmail.com", //c.email
            Admin : c.forename + " " + c.surname,
            Organisation : o.name,
            Amount : this.selectedOrganisation.cf_value_92583,
            Link : this.SlimPayLink,
        };

        this.apiClient.postData("Organisation/SendMandateMail", email)
            .then(d => console.log(d));
    }

    registerOrganisation()
    {
        //todo : registreer organisatie
    }

}