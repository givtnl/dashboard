import {Component, OnInit} from '@angular/core';
import {Http} from '@angular/http';
import {UserService} from 'app/services/user.service';
import {Router, ActivatedRoute} from '@angular/router';
import {TranslateService} from 'ng2-translate';
import {ApiClientService} from "app/services/api-client.service";
import {environment} from "../../environments/environment";
import {OrgMandates} from "../models/OrgMandates";


@Component({
    selector: 'mandate',
    templateUrl: '../html/mandate.component.html',
    styleUrls: ['../css/mandate.component.css']
})

export class MandateComponent implements OnInit {
    showFiltered = false;
    search = "";

    title = "Regel mandaat voor een organisatie";
    subtitle = "Zoek een organisatie bij naam om een mandaat te regelen.";
    searchBtn = "Zoeken";
    disabled = false;

    currentMandates: Array<OrgMandates>;

    filteredOrganisations;
    selectedOrganisation;
    SlimPayLink;
    CRMKey: string;
    incassoStatus = "Laden...";
    urlGetCompanies = "https://app.teamleader.eu/api/getCompanies.php?api_group=50213&amount=10&selected_customfields=93491,92583,95707,93537,93168,93493,93495,93485,93494,95707,93769,141639&pageno=0&searchby=";
    urlGetCompanies2 = "https://app.teamleader.eu/api/getCompanies.php?api_group=50213&amount=10&selected_customfields=93301&pageno=0&searchby=";
    urlGetCompany = "https://app.teamleader.eu/api/getCompany.php?api_group=50213&company_id=";
    urlGetTags = "https://app.teamleader.eu/api/getTags.php?api_group=50213&";

    organisationAdmin: string = null;
    organisationAdminPassword = "fjkldsmqfjklmqsfjlkmq";

    showRegisterAdmin = false;
    adminRegistered = false;

    ngOnInit(): void {
        this.getCurrentOrgMandates();
    }

    constructor(private userService: UserService,
                private router: Router,
                translate: TranslateService,
                private route: ActivatedRoute,
                private http: Http,
                private apiClient: ApiClientService,) {
    }

    get hasEmptyFields(): boolean {
        if (!this.selectedOrganisation
            || !this.selectedOrganisation.cf_value_93168
            || !this.selectedOrganisation.cf_value_93491
            || !(this.selectedOrganisation.mandate_status && this.selectedOrganisation.mandate_status.PayProvMandateStatus === "closed.completed" && this.incassoStatus === "Processed")
            || !(this.currentMandates.filter((cm) => cm.CrmId === this.selectedOrganisation.id).length > 0)
        ) {
            return true;
        }
        return false;
    }

    searchOrg() {
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

    change() {
        if (!this.search) {
            this.filteredOrganisations = [];
        }
    }

    getCompany(crmId) {
        this.apiClient.getData("Admin/ThirdPartyToken?type=Teamleader")
            .then(data => {
                this.CRMKey = data.Teamleader;
                this.apiClient.postData("Admin/CorsTunnelGet", {
                    url: this.urlGetCompany + crmId + "&api_secret=" + this.CRMKey,
                    body: "",
                    headers: {}
                })
                    .then(d => {
                        this.select(d);
                    })
                    .catch();
            });
    }

    getCompanies() {
        this.apiClient.postData("Admin/CorsTunnelGet", {
            url: this.urlGetCompanies + this.search + "&api_secret=" + this.CRMKey,
            body: "{}",
            headers: {}
        })
            .then(d => {
                this.filteredOrganisations = d;
                this.apiClient.postData("Admin/CorsTunnelGet", {
                    url: this.urlGetCompanies2 + this.search + "&api_secret=" + this.CRMKey,
                    body: "{}",
                    headers: {}
                })
                    .then(d => {
                        for (let org in this.filteredOrganisations) {
                            for (let borg in d) {
                                if (this.filteredOrganisations[org].id === d[borg].id) {
                                    this.filteredOrganisations[org].cf_value_93301 = d[borg].cf_value_93301;
                                    this.filteredOrganisations[org].hasVisitors = !isNaN(Number(this.filteredOrganisations[org].cf_value_93301));
                                }
                            }
                        }
                        this.showFiltered = true;
                        this.searchBtn = "Zoeken";
                        this.disabled = false;
                    })
            })
            .catch(err => {
                this.searchBtn = "Zoeken";
                this.disabled = false;
            });
    }

    getCurrentOrgMandates() {
        this.apiClient.getData("Admin/CurrentOrganisations")
            .then(res => {
                this.currentMandates = res;
                for (let man of this.currentMandates) {
                    this.checkIncassoStatus(man.CrmId, man);
                }
            })
            .catch(err => {
            });
    }

    getMandateStatus() {
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

    startIncasso() {
        if (!this.selectedOrganisation.mandate_status) {
            alert("Kan mandaatstatus niet checken, probeer later opnieuw.");
            return;
        }
        if (this.selectedOrganisation.mandate_status.PayProvMandateStatus === "closed.completed" && !this.incassoStatus) {
            let body = {
                Amount: this.selectedOrganisation.cf_value_92583,
                CrmId: this.selectedOrganisation.id
            };
            this.apiClient.postData("Organisation/StartupFee", body)
                .then(res => {
                    alert("Incassoproces is gestart.");
                })
                .catch(err => console.log(err))
        }

        if (this.incassoStatus) alert("Incassoproces is al opgestart.");
    }

    checkIncassoStatus(id, selectedMandate = null) {
        this.apiClient.getData("Debit/Org/" + id)
            .then(data => {
                if (selectedMandate) {
                    return selectedMandate.IncassoStatus = data;
                }
                else {
                    this.incassoStatus = data;
                }
            })
            .catch(err => {
                if (err.status !== 404) {
                    console.log(err);
                }
            });
    }

    decodeHtmlEntity(html) {
        //this hack is needed to decode the ampersand
        //https://stackoverflow.com/questions/7394748/whats-the-right-way-to-decode-a-string-that-has-special-html-entities-in-it
        let txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    select(i) {
        this.disabled = true;
        this.selectedOrganisation = i;
        let dashBoardUsers: string = null;

        if (this.selectedOrganisation.cf_value_93493)
            dashBoardUsers = this.selectedOrganisation.cf_value_93493;

        if (i.hasOwnProperty("custom_fields")) {
            this.selectedOrganisation.cf_value_92583 = this.decodeHtmlEntity(i.custom_fields['92583']);
            this.selectedOrganisation.cf_value_93485 = this.decodeHtmlEntity(i.custom_fields['93485']);
            this.selectedOrganisation.cf_value_93769 = this.decodeHtmlEntity(i.custom_fields['93769']);
            this.selectedOrganisation.cf_value_95707 = this.decodeHtmlEntity(i.custom_fields['95707']);
            this.selectedOrganisation.cf_value_93494 = this.decodeHtmlEntity(i.custom_fields['93494']);
            this.selectedOrganisation.cf_value_93168 = this.decodeHtmlEntity(i.custom_fields['93168']);
            this.selectedOrganisation.cf_value_141639 = this.decodeHtmlEntity(i.custom_fields['141639']);
            this.selectedOrganisation.cf_value_93537 = this.decodeHtmlEntity(i.custom_fields['93537'].replace(/\s/g, ''));
            this.selectedOrganisation.cf_value_93495 = this.decodeHtmlEntity(i.custom_fields['93495']);
            this.selectedOrganisation.cf_value_93491 = this.decodeHtmlEntity(i.custom_fields['93491']);
            this.selectedOrganisation.cf_value_93301 = this.decodeHtmlEntity(i.custom_fields['93301']);
            if(this.selectedOrganisation.cf_value_93301 == "")
            	this.selectedOrganisation.cf_value_93301 = 0;
	        this.selectedOrganisation.hasVisitors = !isNaN(Number(this.selectedOrganisation.cf_value_93301)) && isFinite(Number(this.selectedOrganisation.cf_value_93301)) && Number(this.selectedOrganisation.cf_value_93301) > 0;
	        dashBoardUsers = i.custom_fields['93493'];
            if (i.hasOwnProperty("tags")) {
                this.apiClient.postData("Admin/CorsTunnelGet", {
                    url: this.urlGetTags + "&api_secret=" + this.CRMKey,
                    body: "",
                    headers: {}
                }).then(d => {
                    let status = '';
                    for (let tagid of i.tags)
                        status = status + d[tagid] + ',';
                    status = status.slice(0, -1);
                    if (status.indexOf("Kerk") > -1) {
                        this.selectedOrganisation.status = "Kerk";
                    } else if (status.indexOf("Stichting") > -1) {
                        this.selectedOrganisation.status = "Stichting";
                    } else if (status.indexOf("Artiest") > -1) {
                        this.selectedOrganisation.status = "Artiest";
                    }

                }).catch(err => {
                });
            }
        } else {
            this.selectedOrganisation.cf_value_92583 = this.decodeHtmlEntity(this.selectedOrganisation.cf_value_92583);
            this.selectedOrganisation.cf_value_93485 = this.decodeHtmlEntity(this.selectedOrganisation.cf_value_93485);
            this.selectedOrganisation.cf_value_93769 = this.decodeHtmlEntity(this.selectedOrganisation.cf_value_93769);
            this.selectedOrganisation.cf_value_95707 = this.decodeHtmlEntity(this.selectedOrganisation.cf_value_95707);
            this.selectedOrganisation.cf_value_93494 = this.decodeHtmlEntity(this.selectedOrganisation.cf_value_93494);
            this.selectedOrganisation.cf_value_93168 = this.decodeHtmlEntity(this.selectedOrganisation.cf_value_93168);
            this.selectedOrganisation.cf_value_141639 = this.decodeHtmlEntity(this.selectedOrganisation.cf_value_141639);
            this.selectedOrganisation.cf_value_93537 = this.decodeHtmlEntity(this.selectedOrganisation.cf_value_93537.replace(/\s/g, ''));
            this.selectedOrganisation.cf_value_93495 = this.decodeHtmlEntity(this.selectedOrganisation.cf_value_93495);
            this.selectedOrganisation.cf_value_93491 = this.decodeHtmlEntity(this.selectedOrganisation.cf_value_93491);
            this.selectedOrganisation.cf_value_93301 = this.decodeHtmlEntity(this.selectedOrganisation.cf_value_93301);
	        if(this.selectedOrganisation.cf_value_93301 == "")
		        this.selectedOrganisation.cf_value_93301 = 0;
	        this.selectedOrganisation.hasVisitors = !isNaN(Number(this.selectedOrganisation.cf_value_93301)) && isFinite(Number(this.selectedOrganisation.cf_value_93301)) && Number(this.selectedOrganisation.cf_value_93301) > 0;

	        if (this.selectedOrganisation.status.indexOf("Kerk") > -1) {
                this.selectedOrganisation.status = "Kerk";
            } else if (this.selectedOrganisation.status.indexOf("Stichting") > -1) {
                this.selectedOrganisation.status = "Stichting";
            } else if (this.selectedOrganisation.status.indexOf("Artiest") > -1) {
                this.selectedOrganisation.status = "Artiest";
            } else {
                this.selectedOrganisation.status = "";
            }
        }


        if (this.selectedOrganisation.cf_value_93493)
            dashBoardUsers = this.selectedOrganisation.cf_value_93493;

        if (this.selectedOrganisation.city)
            this.selectedOrganisation.city = this.decodeHtmlEntity(this.selectedOrganisation.city);
        if (this.selectedOrganisation.name)
            this.selectedOrganisation.name = this.decodeHtmlEntity(this.selectedOrganisation.name);
        this.selectedOrganisation.address = this.decodeHtmlEntity(i.street) + " " + i.number;
        this.selectedOrganisation.mandate_status = false;
        if (!environment.production)
            this.selectedOrganisation.cf_value_93495 = "support+" + this.selectedOrganisation.id + "@givtapp.net";

        if (dashBoardUsers) {
            if (dashBoardUsers.split(' ').length === 1)
                this.organisationAdmin = dashBoardUsers.split(',')[0];
            else
                this.organisationAdmin = dashBoardUsers.split(' ')[0];
        } else {
            this.organisationAdmin = "Niet ingevuld in Teamleader!!";
        }

        this.incassoStatus = "Laden...";
        this.change();
        this.getMandateStatus();
        if (this.selectedOrganisation.id)
            this.checkIncassoStatus(this.selectedOrganisation.id);
        this.disabled = false;
        this.filteredOrganisations = false;
    }

    registerMandate() {

        if (!this.selectedOrganisation) {
            return;
        }

        if (this.selectedOrganisation.status.indexOf(',') > -1) {
            alert("Het type van de organisatie is niet correct, namelijk: " + this.selectedOrganisation.status + "\nZorg er voor dat slechts één type aangeduid staat in het CRM.");
            return;
        }

        let o = this.selectedOrganisation;
        if (!o.cf_value_93495 || !o.cf_value_93485 || !o.cf_value_93769 || !o.cf_value_93494) {
            alert("Niet alle velden zijn ingevuld voor de admin van de organisatie!");
            return;
        }

        let f_createMandate = function(that) : void {
            let mandate = {
                Mandate: {
                    Signatory: {
                        email: environment.production ? o.cf_value_93495 : "support+" + that.selectedOrganisation.id + "@givtapp.net",
                        familyName: o.cf_value_93485,
                        givenName: o.cf_value_93769,
                        companyName: o.cf_value_95707,
                        telephone: o.cf_value_93494,
                        bankAccount: {
                            iban: o.cf_value_93537.replace(/\s/g, '')
                        },
                        billingAddress: {
                            city: o.city,
                            country: o.country,
                            postalCode: o.zipcode,
                            street1: o.address,
                            street2: "", //empty
                        }
                    }
                },
                Organisation: {
                    CrmId: o.id.toString(),
                    Name: o.name,
                    Address: o.address,
                    City: o.city,
                    PostalCode: o.zipcode,
                    Country: o.country,
                    TaxDeductable: (o.cf_value_141639 === "1"),
                    TelNr: o.telephone
                },
                Type: that.selectedOrganisation.status
            };
            that.apiClient.postData("Organisation/", mandate)
                .then(spl => {
                    if (spl) {
                        that.SlimPayLink = spl;
                        that.sendMandateMail();
                    }
                    else {
                        alert("Something went wrong, please check mandate data and logging.");
                    }
                }).catch( error => {
                console.error(error);
                alert("Mandaat niet verzonden, controleer alle gegevens.");
            });

        };

        if (this.selectedOrganisation.mandate_status) {
            if (!confirm("Weet je het zeker?")) return;
            else {
                this.apiClient.delete("organisation/" + this.selectedOrganisation.id)
                    .then(_ => f_createMandate(this))
                    .catch( error => {
                        console.error(error);
                        alert("Niet gelukt om de bestaande organisatie te verwijderen!");
                    });
            }
        } else {
            f_createMandate(this);
        }
    }

    sendMandateMail() {
        if (!this.SlimPayLink) return;
        if (!this.selectedOrganisation) return;

        let o = this.selectedOrganisation;
        if (!o.cf_value_92583 || !o.cf_value_93495 || !o.cf_value_93769 || !o.cf_value_93485) {
            alert("Email, administrator naam en bedrag van kosten moeten ingevuld zijn om een mandaat te kunnen aanmaken.");
        }

        let email = {
            Email: environment.production ? o.cf_value_93495 : "bjorn.derudder+" + this.selectedOrganisation.id + "@gmail.com",
            Admin: environment.production ? o.cf_value_93769 + " " + o.cf_value_93485 : "Bjorn Derudder",
            Organisation: o.name,
            Amount: this.selectedOrganisation.cf_value_92583,
            Link: this.SlimPayLink,
            Type: this.selectedOrganisation.status
        };
        this.apiClient.postData("Organisation/SendMandateMail", email)
            .then(d => {
                alert("Mandaat is verzonden.");
            }).catch(error => {
                console.log(error);
                alert("Mandaat niet verzonden, controleer alle gegevens.");
            });
    }

    registerDefaultCollectGroup() {
        if (!this.selectedOrganisation) {
            return;
        }
        if(!this.selectedOrganisation.hasVisitors) {
            alert("Het bezoekersveld mag enkel getallen bevatten én moet hoger zijn dan 0. Los dit akkefietje op vooraleer je een mandaat aanvraagt.");
            return;
        }
        let o = this.selectedOrganisation;
        let cg = {
            Name: o.cf_value_93168,
            Namespace: o.cf_value_93491,
            PaymentReference: "Automatische betaling Givt",
            Active: true,
            VisitorCount: o.cf_value_93301
        };
        this.apiClient.postData("CollectGroup?crmId=" + o.id, cg)
            .then(res => {
                if (res)
                    alert("Gelukt!");
            }).catch(res => {
            alert("Mislukt!");
        });
    }

    registerOrganisationAdmin() {
        if (!this.organisationAdmin || !this.organisationAdminPassword) {
            return;
        }
        this.adminRegistered = true;
        this.generateOrgAdminPass();
        let user =
            {
                Email: this.organisationAdmin,
                Password: this.organisationAdminPassword
            };

        this.apiClient.postData('Users', user)
            .then(res => {
                let url = '/Users/CreateOrgAdmin?' + 'email=' + encodeURIComponent(this.organisationAdmin) + '&crmId=' + this.selectedOrganisation.id + '&password=' + this.organisationAdminPassword;
                this.apiClient.postData(url, null)
                    .then(_ => {
                        alert('Admin registered with new e-mail address');
                    })
                    .catch(reason => {
                        alert(reason["_body"]);
                    });
            })
            .catch(reason => {
                if (reason.status === 409) {
                    let url = '/Users/CreateOrgAdmin?' +'email=' + encodeURIComponent(this.organisationAdmin) + '&crmId=' + this.selectedOrganisation.id;
                    this.apiClient.postData(url, null)
                        .then(_ => {
                            alert('Admin registered with existing e-mail address');
                        })
                        .catch(res => {
                            alert(res["_body"]);
                        });
                } else {
                    alert(reason["_body"]);
                }
            });
    }

    generateOrgAdminPass() {
        let text = "";
        let charsNeeded = false;
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        while (!charsNeeded) {
            for (let i = 0; i < 8; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            if (/\d/.test(text) && /[A-Z]/.test(text))
                charsNeeded = true;
            else
                text = "";
        }
        this.organisationAdminPassword = text;
    }

    openCRM() {
        let url = "https://app.teamleader.eu/company_detail.php?id=";
        if (this.selectedOrganisation) {
            let win = window.open(url + this.selectedOrganisation.id, "_blank");
            win.focus();
        }
    }
}
