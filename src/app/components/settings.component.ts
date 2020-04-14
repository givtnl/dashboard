import { DataService } from "../services/data.service";
import { Component, OnInit, AfterViewInit } from "@angular/core";
import { LangChangeEvent, TranslateService } from "ng2-translate";
import { UserService } from "../services/user.service";
import { isNullOrUndefined } from "util";


@Component({
	selector: "settings",
	templateUrl: '../html/settings.component.html',
	styleUrls: ['../css/settings.component.css'],
})

export class SettingsComponent implements OnInit {
	private _firstDay: number = 0;
	private days = [];
	public isSettingsDetailVisible = false;
	public isDeepLinkVisible = false;
	public isQRCodeSettingVisible = false;

	public currentCollectGroup;
	requestMediumIdTitle: String;
	requestMediumIdBody: String;

	private selectedQRLanguage: String;
	public availableLanguages = [{ value: "en", name: "EN" }, { value: "nl", name: "NL" }]

	requestMediumIdManual: String;
	get firstDay(): number {
		return this._firstDay;
	}

	set firstDay(value: number) {
		this._firstDay = value;
		this.dataService.writeData("FirstDayOfWeek", value, true);
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
		});

		if (!isNullOrUndefined(navigator.language)) {
			this.selectedQRLanguage = navigator.language.substring(0, 2)
		}
	}

	constructor(private dataService: DataService, private translateService: TranslateService, private userService: UserService) {
		this.loadTerms();
		this.currentCollectGroup = userService.CurrentCollectGroup;
		this.loadConnectWithGivt();
		var en = this.availableLanguages.filter(x=>x.value == "en")[0]
		var nl  = this.availableLanguages.filter(x=>x.value == "nl")[0]
		en.name = this.translateService.instant("LanguageEN")
		nl.name = this.translateService.instant("LanguageNL")
		this.availableLanguages = [en, nl]
		console.log(this.availableLanguages)
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
		this.requestMediumIdBody = this.translateService.instant("RequestMediumIdBody");
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
	}
}
