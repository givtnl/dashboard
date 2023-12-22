import { DataService } from "../services/data.service";
import { Component, OnInit } from "@angular/core";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { UserService } from "../services/user.service";
import { LoggingService } from "../services/logging.service";


@Component({
    selector: "settings",
    templateUrl: '../html/settings.component.html',
    styleUrls: ['../css/settings.component.css'],
})
export class SettingsComponent implements OnInit {
    protected _firstDay: number = 0;
    protected days = [];
    protected selectedQRLanguage: String;
    public isSettingsDetailVisible = false;
    public isDeepLinkVisible = false;
    public isQRCodeSettingVisible = false;
    public currentCollectGroup;

    requestMediumIdTitle: String;
    requestMediumIdBody: String;
    requestMediumIdManual: String;


    public availableLanguages: any

    constructor(
        private loggingService: LoggingService,
        private dataService: DataService,
        private translateService: TranslateService,
        private userService: UserService) {
        this.loadTerms();
        this.currentCollectGroup = userService.CurrentCollectGroup;
        this.loadConnectWithGivt();
        this.loadQRLanguages();
    }

    ngOnInit() {
        window.scrollTo(0, 0);
        let localDay = this.dataService.getData("FirstDayOfWeek");
        if (!isNaN(localDay)) {
            this.firstDay = localDay;
        }

        this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
            this.loadTerms();
            this.loadConnectWithGivt();
            this.loadQRLanguages();
        });

        if (navigator.language !== undefined && navigator.language !== null) {
            this.selectedQRLanguage = navigator.language.substring(0, 2)
        }
    }

    get firstDay(): number {
        return this._firstDay;
    }

    set firstDay(value: number) {
        this._firstDay = value;
        this.dataService.writeData("FirstDayOfWeek", value, true);
    }


    private loadQRLanguages() {
        this.availableLanguages = [
            {
                name: this.translateService.instant("LanguageEN"),
                value: "en"
            },
            {
                name: this.translateService.instant("LanguageNL"),
                value: "nl"
            }
        ]
    }

    private loadTerms() {
        this.days.length = 0;
        this.days.push(this.translateService.instant("Zondag").toString());
        this.days.push(this.translateService.instant("Monday").toString());
        this.days.push(this.translateService.instant("Tuesday").toString());
        this.days.push(this.translateService.instant("Wednesday").toString());
        this.days.push(this.translateService.instant("Thursday").toString());
        this.days.push(this.translateService.instant("Friday").toString());
        this.days.push(this.translateService.instant("Saturday").toString());
    }

    private loadConnectWithGivt() {
        this.requestMediumIdTitle = this.translateService.instant("RequestMediumIdTitle").toString();
        this.requestMediumIdTitle = this.requestMediumIdTitle.replace("{0}", this.currentCollectGroup.Name);
        this.requestMediumIdTitle = this.requestMediumIdTitle.replace("{1}", this.currentCollectGroup.Namespace);
        if (this.userService && this.userService.CurrentCollectGroup.Country !== 'US') {
            this.requestMediumIdBody = this.translateService.instant("RequestMediumIdBody");
        } else {
            this.requestMediumIdBody = this.translateService.instant("RequestMediumIdBodyUS");
        }
        this.requestMediumIdManual = this.translateService.instant("RequestMediumIdManual");
    }

    goBack() {
        window.history.back();
    }

    goBackToSettings() {
        this.isSettingsDetailVisible = false;
    }

    copyNamespace() {
        let copyText = document.getElementById("cg-namespace") as HTMLInputElement;
        copyText.focus();
        copyText.select();
        document.execCommand("Copy");
    }

    saveQRCodeLanguage() {
        this.dataService.writeData("SelectedQRCodeLanguage", this.selectedQRLanguage, true)
        var button = document.getElementById("QRSET")
        button.classList.add("qr-check-fade");
        this.loggingService.info(`QR Code language changed to ${this.selectedQRLanguage} for collectgroup: ${this.userService.CurrentCollectGroup.Name}`)
    }
}
