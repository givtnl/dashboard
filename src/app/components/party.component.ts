import {Component, OnInit} from "@angular/core";
import {ApiClientService} from "../services/api-client.service";
import {DataService} from "../services/data.service";
import {AssignedCollection} from "./assign.component";
import {ISODatePipe} from "../pipes/iso.datepipe";

@Component({
	selector: 'my-party',
	templateUrl: '../html/party.component.html',
	styleUrls: ['../css/party.component.css']
})
export class PartyComponent implements OnInit {

	public selectedValue: string = "-1";
	public timeSet: string = "";
	public guid = "";
	private timer = null;
	ngOnInit(): void {
		let currentCollectGroup = this.dataService.getData("CurrentCollectGroup");
		if (currentCollectGroup) {
			this.guid = JSON.parse(currentCollectGroup).GUID;
			this.apiService.getData('v2/collectgroups/celebration/' + this.guid)
				.then(resp => {
					console.log(resp);
					if(resp.Celebrations && resp.dt_Celebration != null) {
						let newDate = new Date(resp.dt_Celebration);
						this.showSetTime(newDate);
					}
				})
		}

	}

	get allowSaving(): boolean {
		return parseInt(this.selectedValue) > 0;
	}

	showSetTime(date: Date) {
		this.timeSet = "Het feestmoment werd ingesteld op: " + this.datePipe.transform(date, 'medium');
	}

	save() {
		if(!this.allowSaving) {
			return;
		}
		let seconds = parseInt(this.selectedValue);
		let currentDate = new Date();
		currentDate.setSeconds(currentDate.getSeconds() + seconds);

		let dateToSend = currentDate.toISOString();
		this.apiService.postData('v2/collectgroups/celebration/' + this.guid  + "?dtCelebration=" + dateToSend, null)
			.then(resp => {
				if(resp == "") {
					this.showSetTime(currentDate);
				}
			})
	}

	delete() {
		this.apiService.delete('v2/collectgroups/celebration/' + this.guid)
			.then(resp => {
				let r = resp as any;
				console.log((r as Response).status);
				if((r as Response).status) {
					this.timeSet = "";
				}
			});

	}

	constructor(private apiService: ApiClientService, private dataService: DataService, private datePipe: ISODatePipe) {
	}
}
