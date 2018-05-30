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
	public timeRemaining: string = "";
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
						this.countdownTimer(Number(resp.SecondsRemaining));
						this.showSetTime(newDate);
					}
				})
		}

	}

	get allowSaving(): boolean {
		return parseInt(this.selectedValue) > 0;
	}

	countdownTimer(seconds: number) {
		this.timeRemaining = this.calculateMinAndSeconds(seconds);
		var downloadTimer = setInterval(function(){
			seconds--;
			this.timeRemaining = this.calculateMinAndSeconds(seconds);
			if(seconds <= 0) {
				clearInterval(downloadTimer);
				this.timeRemaining = null;
			}

		}.bind(this),1000);
	}

	calculateMinAndSeconds(secondsLeft: number): string {
		let minutes: number = Math.trunc(secondsLeft / 60);
		let seconds: number = secondsLeft % 60;
		if (minutes == 0) {
			return seconds + "s";
		} else {
			return minutes +"m" + " " + seconds + "s"
		}
	}

	showSetTime(date: Date) {
		this.timeSet = this.datePipe.transform(date, 'medium');
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
        console.log(resp);
				if(resp != "") {

          this.countdownTimer(Number(resp.SecondsRemaining));
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
