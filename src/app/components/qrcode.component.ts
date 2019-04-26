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
	
	ngOnInit(): void {
		alert('Hi Jonas this component is initialized')
	}
}
