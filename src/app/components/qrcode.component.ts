import {Component, OnInit} from "@angular/core";
import {ApiClientService} from "../services/api-client.service";
import {DataService} from "../services/data.service";
import {ISODatePipe} from "../pipes/iso.datepipe";
import { UserService } from "app/services/user.service";

@Component({
	selector: 'qr-code',
	templateUrl: '../html/qrcode.component.html',
	styleUrls: ['../css/qrcode.component.css']
})
export class QRCodeComponent implements OnInit {

    constructor(private apiService: ApiClientService, private dataService: DataService, private datePipe: ISODatePipe) {
        
	}

	slideIndex = 1;

	next(n) {
		this.showquestion(this.slideIndex += n);
	}
	previous(n) {
		this.showquestion(this.slideIndex -= n)
	}

	showquestion(n) {
		var slides = document.getElementsByClassName("questions-component");
	}
	
	ngOnInit(): void {
		var myQRQuestion = 0;

		



	}
}
