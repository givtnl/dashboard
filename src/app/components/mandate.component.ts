/**
 * Created by Lennie on 28/03/2017.
 */
import {Component, OnInit, ViewEncapsulation, isDevMode, enableProdMode} from '@angular/core';
import {HttpModule, Http, Headers, RequestOptions} from '@angular/http';
import { UserService } from 'app/services/user.service';
import {Router, ActivatedRoute} from '@angular/router';
import {TranslateService} from 'ng2-translate';
import {Organisation} from "../models/organisation";
import { ApiClientService } from "app/services/api-client.service";
import { environment } from "../../environments/environment";
import {OrgMandates} from "../models/OrgMandates";


@Component({
    selector: 'mandate',
    templateUrl: '../html/mandate.component.html',
    styleUrls: ['../css/mandate.component.css']
})

export class MandateComponent implements OnInit{
    ngOnInit(): void {
        this.getCurrentOrgMandates();
    }

    showFiltered: boolean = false;
    search: string = "";

    title: string = "Regel mandaat voor een organisatie";
    subtitle: string = "Zoek een organisatie bij naam om een mandaat te regelen.";
    searchBtn: string = "Zoeken";
    disabled: boolean = false;

    currentMandates: Array<OrgMandates>;

    filteredOrganisations;
    selectedOrganisation;
    SlimPayLink;
    CRMKey : string;
    incassoStatus: string = "Laden...";
    urlGetCompanies: string = "https://app.teamleader.eu/api/getCompanies.php?api_group=50213&amount=10&selected_customfields=92583,95707,93537,93168,93495,93485,93494,93485,95707,93769&pageno=0&searchby=";

    constructor(
        private userService: UserService,
        private router: Router,
        translate: TranslateService,
        private route: ActivatedRoute,
        private http: Http,
        private apiClient: ApiClientService,
    ){}

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
                this.searchBtn = "Zoeken"
                this.disabled = false;
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

    getCurrentOrgMandates(){
        this.apiClient.getData("Admin/CurrentOrganisations")
            .then(res => {
                this.currentMandates = res;
                for(let man in this.currentMandates){
                    this.checkIncassoStatus(this.currentMandates[man].CrmId, this.currentMandates[man])
                }
            })
            .catch(err => {
                console.log(err);
            })
    }

     getMandateStatus(){
        this.apiClient.getData("OrgMandate/" + this.selectedOrganisation.id)
            .then(res => {
                this.selectedOrganisation.mandate_status = res;
              this.searchBtn = "Zoeken";
              this.disabled = false;
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

    checkIncassoStatus(id, selectedMandate = null){
        this.apiClient.getData("Debit/Org/" + id)
            .then(data => {
                if(selectedMandate)
                {
                    return selectedMandate.IncassoStatus = data;
                }
                else
                {
                    this.incassoStatus = data
                }
            })
            .catch(err => console.log(err));
    }

    decodeHtmlEntity(html){
        //this hack is needed to decode the ampersand
        //https://stackoverflow.com/questions/7394748/whats-the-right-way-to-decode-a-string-that-has-special-html-entities-in-it
        let txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    select(i){
        console.log(i);
        this.disabled = true;
        this.selectedOrganisation = i;
        //replace spaces in IBAN
        if (this.selectedOrganisation.cf_value_93537 != null)
           this.selectedOrganisation.cf_value_93537 = i.cf_value_93537.replace(/\s/g, '');
        if(this.selectedOrganisation.city)
           this.selectedOrganisation.city = this.decodeHtmlEntity(this.selectedOrganisation.city);
        if(this.selectedOrganisation.name)
            this.selectedOrganisation.name = this.decodeHtmlEntity(this.selectedOrganisation.name);
        this.selectedOrganisation.mandate_status = false;
        this.incassoStatus = "Laden...";
        this.change();
        this.getMandateStatus();
        if(this.selectedOrganisation.id)
            this.checkIncassoStatus(this.selectedOrganisation.id);
        this.disabled = false;
        this.filteredOrganisations = false;
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
                    companyName: o.cf_value_95707,
                    telephone : o.cf_value_93494,
                    bankAccount : {
                        iban: o.cf_value_93537
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
        this.apiClient.postData("OrgMandate/", mandate )
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
            Email : environment.production ? o.cf_value_93495 : "support@givtapp.net",
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
                        Number: o.cf_value_93537, //iban
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
