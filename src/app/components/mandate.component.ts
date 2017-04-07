/**
 * Created by Lennie on 28/03/2017.
 */
import {Component, OnInit, ViewEncapsulation, isDevMode} from '@angular/core';
import {HttpModule, Http, Headers, RequestOptions} from '@angular/http';
import { UserService } from 'app/services/user.service';
import {Router, ActivatedRoute} from '@angular/router';
import {TranslateService} from 'ng2-translate';
import { CompleterService, CompleterData } from 'ng2-completer';
import {Organisation} from "../models/organisation";
import { ApiClientService } from "app/services/api-client.service";
import { environment } from "../../environments/environment";


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
    SlimPayLink;
    CRMKey : string;
    incassoStatus: string = "Laden...";
    urlGetCompanies: string = "https://app.teamleader.eu/api/getCompanies.php?api_group=50213&amount=10&selected_customfields=92583,93168,93495,93485,93494,93485,93769&pageno=0&searchby=";

    constructor(
        private userService: UserService,
        private router: Router,
        translate: TranslateService,
        private route: ActivatedRoute,
        private http: Http,
        private apiClient: ApiClientService,
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
                this.getCompanies();
            });

    }

    change()
    {
        if(!this.search){
            this.filteredOrganisations = [];
        }
    }

    getCompanies(){
        this.apiClient.postData("Admin/CorsTunnelGet", {url : this.urlGetCompanies + this.search + "&api_secret=" + this.CRMKey,body : "{}", headers: {}})
            .then(d => {
                this.filteredOrganisations = d;
                this.showFiltered = true;
                this.searchBtn = "Zoeken";
                this.disabled = false;
            })
            .catch(err => {
                this.searchBtn = "Zoeken";
                this.disabled = false;
            });
    }

     getMandateStatus(){
        this.apiClient.getData("Mandate/Org/" + this.selectedOrganisation.id)
            .then(res => {
                this.selectedOrganisation.mandate_status = res;
            })
            .catch(err => {
                this.searchBtn = "Zoeken";
                this.disabled = false;
            });
    }

    startIncasso(){
         if(!this.selectedOrganisation.mandate_status) {
             alert("Kan mandaatstatus niet checken, probeer later opnieuw.");
             return;
         }
        if(this.selectedOrganisation.mandate_status.PayProvMandateStatus == "closed.completed" && !this.incassoStatus){
            let body = {
                    Amount: this.selectedOrganisation.cf_value_92583,
                    CrmId: this.selectedOrganisation.id
            };
            console.log(body);
            this.apiClient.postData("Organisation/StartupFee", body)
                .then(res => {
                    console.log(res);
                    alert("Incassoproces is gestart.");
                })
                .catch(err => console.log(err))
        }

        if(this.incassoStatus) alert("Incassoproces is al opgestart.");
    }

    checkIncassoStatus(){
        if(this.selectedOrganisation.id){
            this.apiClient.getData("Debit/Org/" + this.selectedOrganisation.id)
                .then(data => this.incassoStatus = data)
                .catch(err => console.log(err));
        }
    }

    select(i){
        console.log(i);
        this.searchBtn = "Laden...";
        this.disabled = true;
        this.selectedOrganisation = i;
        this.selectedOrganisation.mandate_status = false;
        this.incassoStatus = "Laden...";
        this.search = "";
        this.change();
        this.getMandateStatus();
        this.checkIncassoStatus();
    }

    registerMandate(){
        if(!this.selectedOrganisation){
            return;
        }
        let o = this.selectedOrganisation;
        if(!o.cf_value_93495 || !o.cf_value_93485 || !o.cf_value_93769 || !o.cf_value_93494){
            alert("Niet alle velden zijn ingevuld voor de admin van de organisatie!");
            return;
        }
        let mandate = {
            Mandate : {
                Signatory : {
                    email :  o.cf_value_93495,
                    familyName : o.cf_value_93485,
                    givenName :  o.cf_value_93769,
                    companyName: o.name,
                    telephone : o.cf_value_93494,
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
        if(!this.selectedOrganisation) return;

        let o = this.selectedOrganisation;
        if(!o.cf_value_92583 || !o.cf_value_93495 || !o.cf_value_93769 || !o.cf_value_93485){
            alert("Email, administrator naam en bedrag van kosten moeten ingevuld zijn om een mandaat te kunnen aanmaken.");
        }

        let email = {
            Email : isDevMode ? "support@givtapp.net" : o.cf_value_93495,
            Admin : o.cf_value_93769 + " " + o.cf_value_93485,
            Organisation : o.name,
            Amount : this.selectedOrganisation.cf_value_92583,
            Link : this.SlimPayLink,
        };
        console.log(email);
        this.apiClient.postData("Organisation/SendMandateMail", email)
            .then(d => { alert("Mandaat is verzonden."); console.log(d); });
    }

    registerOrganisation()
    {
        if(!this.selectedOrganisation){
            return;
        }
        let o = this.selectedOrganisation;
        let organisation = {
            Organisation : {
                Name: o.cf_value_93168,
                Address: o.street,
                City: o.city,
                PostalCode: o.zipcode,
                Country: o.country,
                TelNr: o.telephone,
                Accounts: [
                    {
                        Number: o.iban, //iban
                        Primary: true,
                        Active: true
                    }
                ]
            },
            CrmId : this.selectedOrganisation.id.toString()
        };
        console.log(JSON.stringify(organisation));
        this.apiClient.postData("Organisation", organisation)
            .then(res => { alert("Gelukt!"); console.log(res) });
    }

    openCRM(){
        let url = "https://app.teamleader.eu/company_detail.php?id=";
        if(this.selectedOrganisation)
         window.location.href = url + this.selectedOrganisation.id;
    }
}