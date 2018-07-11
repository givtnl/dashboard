import {DataService} from "../services/data.service";
import {Component, OnInit} from "@angular/core";
import {LangChangeEvent, TranslateService} from "ng2-translate";

@Component({
	selector: "settings",
	templateUrl: '../html/settings.component.html',
	styleUrls: ['../css/settings.component.css'],
})

export class SettingsComponent implements OnInit {
	private _firstDay: number = 0;
	private days = [];
	public isSettingsDetailVisible = false;
	get firstDay(): number {
		return this._firstDay;
	}

	set firstDay(value: number) {
		this._firstDay = value;
		this.dataService.writeData("FirstDayOfWeek", value, true);
	}

	ngOnInit() {
		window.scrollTo(0,0);
		console.log("init settings");
		let localDay = this.dataService.getData("FirstDayOfWeek");
		if(!isNaN(localDay)) {
			this.firstDay = localDay;
		}

		this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
			this.loadTerms();
		});

	}

	constructor(private dataService: DataService, private translateService: TranslateService) {
		this.loadTerms();
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

	goBack() {
		window.history.back();
	}

	goBackToSettings() {
		this.isSettingsDetailVisible = false;
	}

}