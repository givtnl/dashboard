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
    urlGetCompanies: string = "https://app.teamleader.eu/api/getCompanies.php?api_group=50213&amount=10&selected_customfields=92583,95707,93537,93168,93495,93485,93494,93485,95707,93769,141639&pageno=0&searchby=";
    urlGetCompany: string = "https://app.teamleader.eu/api/getCompany.php?api_group=50213&company_id=";

    organisationAdmin: string = "Lenin";
    organisationAdminPassword: string = "fjkldsmqfjklmqsfjlkmq";

    showRegisterAdmin : boolean = false;
    adminRegistered: boolean = false;

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

        this.apiClient.getData("Admin/ThirdPartyToken?type=Teamleader")
            .then(data => {
                this.CRMKey = data.Teamleader;
                this.getCompanies();
                this.searchBtn = "Zoeken";
                this.disabled = false;
            });

    }

    change()
    {
        if(!this.search){
            this.filteredOrganisations = [];
        }
    }

    getCompany(crmId){
      this.apiClient.getData("Admin/ThirdPartyToken?type=Teamleader")
        .then(data => {
          this.CRMKey = data.Teamleader;
          this.apiClient.postData("Admin/CorsTunnelGet", {url : this.urlGetCompany + crmId + "&api_secret=" + this.CRMKey, body : "", headers: {}})
            .then(d => {
              this.select(d);
            })
            .catch(err => {

            });
        });
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
        this.disabled = true;
        this.selectedOrganisation = i;

        if (i.hasOwnProperty("custom_fields")) {
            this.selectedOrganisation.cf_value_92583 = i.custom_fields['92583'];
            this.selectedOrganisation.cf_value_93485 = i.custom_fields['93485'];
            this.selectedOrganisation.cf_value_93769 = i.custom_fields['93769'];
            this.selectedOrganisation.cf_value_95707 = i.custom_fields['95707'];
            this.selectedOrganisation.cf_value_93494 = i.custom_fields['93494'];
            this.selectedOrganisation.cf_value_93168 = i.custom_fields['93168'];
            this.selectedOrganisation.cf_value_141639 = i.custom_fields['141639'];
            this.selectedOrganisation.cf_value_93537 = i.custom_fields['93537'].replace(/\s/g, '');
            this.selectedOrganisation.cf_value_93495 = i.custom_fields['93495'];
        } else {
            if (this.selectedOrganisation.cf_value_93537 != null)
                this.selectedOrganisation.cf_value_93537 = i.cf_value_93537.replace(/\s/g, '');
        }

        if(this.selectedOrganisation.city)
           this.selectedOrganisation.city = this.decodeHtmlEntity(this.selectedOrganisation.city);
        if(this.selectedOrganisation.name)
            this.selectedOrganisation.name = this.decodeHtmlEntity(this.selectedOrganisation.name);
        this.selectedOrganisation.mandate_status = false;
        if(!environment.production)
            this.selectedOrganisation.cf_value_93495 =  "support+" + this.selectedOrganisation.id + "@givtapp.net";

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
                    email :  environment.production? o.cf_value_93495 : "support+" + this.selectedOrganisation.id + "@givtapp.net",
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
            Organisation : {
                CrmId : o.id.toString(),
                Name: o.name,
                Address: o.street,
                City: o.city,
                PostalCode: o.zipcode,
                Country: o.country,
                TaxDeductable: (o.cf_value_141639 == "1"),
                TelNr: o.telephone
            }
        };
        this.apiClient.postData("Organisation/", mandate )
            .then(spl => {
                if(spl){
                    this.SlimPayLink = spl;
                    this.sendMandateMail();
                }
                else{
                    alert("Something went wrong, please check mandate data and logging.");
                }
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
            Email : environment.production ? o.cf_value_93495 : "bjorn.derudder+" + this.selectedOrganisation.id + "@gmail.com",
            Admin : environment.production? o.cf_value_93769 + " " + o.cf_value_93485 : "Bjorn Derudder",
            Organisation : o.name,
            Amount : this.selectedOrganisation.cf_value_92583,
            Link : this.SlimPayLink,
        };
        this.apiClient.postData("Organisation/SendMandateMail", email)
            .then(d => { alert("Mandaat is verzonden."); console.log(d); });
    }

    registerDefaultCollectGroup()
    {
        if(!this.selectedOrganisation){
            return;
        }
        let o = this.selectedOrganisation;
        this.apiClient.postData("CollectGroup?crmId=" + o.id, null)
            .then(res => {
                if (res)
                    alert("Gelukt!");
                else
                    alert("Mislukt!");
                console.log(res)
            });
    }

    registerOrganisationAdmin(){
        if(!this.organisationAdmin || !this.organisationAdminPassword){
            return;
        }
        this.adminRegistered = true;
        let user =
        {
            Email: this.organisationAdmin,
            Password: this.organisationAdminPassword
        };

        this.apiClient.postData('Users', user)
            .then(res => {
                let path = '';
                let email = this.organisationAdmin.replace('+', '%2B');
                if(!res.status)
                    path = '/Users/CreateOrgAdmin?email='+email+'&crmId='+this.selectedOrganisation.id+'&password='+this.organisationAdminPassword;
                else
                    path = '/Users/CreateOrgAdmin?email='+email+'&crmId='+this.selectedOrganisation.id;
                this.apiClient.postData(path, null)
                    .then(response => {
                        if(response.status > 300)
                        {
                            var error = response.status + " : " + response._body;
                            alert(error);
                            this.adminRegistered = false;
                        }else{
                            alert('admin registered');
                        }
                    })
                    .catch(err => {this.adminRegistered = false;});
            });
    }

    generateOrgAdminPass(){
        var text = "";
        var charsNeeded = false;
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&%$";

        while (!charsNeeded) {
            for (var i = 0; i < 8; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            if (/\d/.test(text) && /[A-Z]/.test(text))
                charsNeeded = true;
            else
                text = "";
        }
        this.organisationAdminPassword = text;
    }

    openCRM(){
        let url = "https://app.teamleader.eu/company_detail.php?id=";
        if(this.selectedOrganisation)
         window.location.href = url + this.selectedOrganisation.id;
    }
}
