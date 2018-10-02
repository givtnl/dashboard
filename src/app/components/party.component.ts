import {Component, OnInit} from "@angular/core";
import {ApiClientService} from "../services/api-client.service";
import {DataService} from "../services/data.service";
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
	private countdownInterval: number;
	ngOnInit(): void {
		let currentCollectGroup = this.dataService.getData("CurrentCollectGroup");
		if (currentCollectGroup) {
			this.guid = JSON.parse(currentCollectGroup).GUID;
			this.apiService.getData('v2/collectgroups/celebration/' + this.guid)
				.then(resp => {
					if(resp.Celebrations && resp.dt_Celebration != null && resp.SecondsRemaining > 0) {
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
		this.countdownInterval = setInterval(function(){
			seconds--;
			this.timeRemaining = this.calculateMinAndSeconds(seconds);
			if(seconds <= 0) {
				clearInterval(this.countdownInterval);
				this.timeRemaining = null;
				document.getElementById("delete-button").style.display = "none";
				setTimeout(()=>{
				this.clearPartyMoment();
				}, 10000);
			}

		}.bind(this),1000);
	}

	clearPartyMoment(){
	this.timeSet = '';
	var partytime = document.getElementById("selected-partytime") as HTMLSelectElement;
	partytime.selectedIndex = 0;
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
		clearInterval(this.countdownInterval);

		if(!this.allowSaving) {
			return;
		}
		let seconds = parseInt(this.selectedValue);
		let currentDate = new Date();
		currentDate.setSeconds(currentDate.getSeconds() + seconds);

		let dateToSend = currentDate.toISOString();
		this.apiService.postData('v2/collectgroups/celebration/' + this.guid  + "?dtCelebration=" + dateToSend, null)
			.then(resp => {
				if(resp != "") {

          this.countdownTimer(Number(resp.SecondsRemaining));
          this.showSetTime(currentDate);
				}
			})

	}

	delete() {
		clearInterval(this.countdownInterval);
		this.apiService.delete('v2/collectgroups/celebration/' + this.guid)
			.then(resp => {
				let r = resp as any;
				//console.log((r as Response).status);
				if((r as Response).status) {
					this.timeSet = "";
				}
			});

	}

	constructor(private apiService: ApiClientService, private dataService: DataService, private datePipe: ISODatePipe) {
	}
}
