import { Component, OnInit } from "@angular/core";
import { ApiClientService } from "../services/api-client.service";
import { DataService } from "../services/data.service";
import { ISODatePipe } from "../pipes/iso.datepipe";
import { UserService } from "../services/user.service";
import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";
import { Router } from '@angular/router';
import { Http, Headers, URLSearchParams } from '@angular/http';
import { TimeoutError } from "rxjs";
import { sendRequest } from "selenium-webdriver/http";

@Component({
	selector: 'qr-code',
	templateUrl: '../html/qrcode.component.html',
	styleUrls: ['../css/qrcode.component.css']
})
export class QRCodeComponent implements OnInit {

	constructor(private apiService: ApiClientService, private dataService: DataService, private datePipe: ISODatePipe, private router: Router, private http: Http, private userService: UserService) {

	}

	currentQuestionId:number = 1;
	fieldArray: string[] = [];

	showNextQuestion(value: number) {
		console.log(this.currentQuestionId)
		this.currentQuestionId+=value;
	}
	showPreviousQuestion(value: number = 1) {
		console.log(this.currentQuestionId)
		this.currentQuestionId-=value;
	}

	addFieldValue() {
		this.fieldArray.push(this.newAttribute)
		this.newAttribute = "";
	}

	deleteFieldValue(index) {
		this.fieldArray.splice(index, 1);
	}

	trackByFn(index: any, item: any) {
		return index;
	}

	submit() {
		let body: QRRequestBody = { generic: this.isChecked, email: this.email, phoneNumber: this.phonenumber, collectGoals: this.fieldArray }
		let apiUrl = 'v2/collectgroups/' + this.userService.CurrentCollectGroup.GUID + '/qrcodes';

		this.apiService.postData(apiUrl, body)
			.then(resp => {
				console.log(resp);
			});
		
	}

	onEmailchange() {
		var emailField = <HTMLInputElement>document.getElementById('email')
		this.email = emailField.value;	
		const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
		this.isEmailValid = regexp.test(this.email)
		this.showSubmit = this.isPhoneValid && this.isEmailValid
	}

	onPhonenumberChange() {
		this.phonenumber = (<HTMLInputElement>document.getElementById('phonenumber')).value;

		var currentValue = this.phonenumber;
		if (
			(currentValue.length == 10 && (currentValue.charAt(1) == "6" || currentValue.charAt(1) == "4")) ||
			(currentValue.length == 11 && currentValue.charAt(1) == "7")
		) {
			this.isPhoneValid = true
		} else {
			this.isPhoneValid = false
		}

		this.showSubmit = this.isPhoneValid && this.isEmailValid

		return this.isPhoneValid
	}





	skippedToEnd = false;

	isChecked = false;
	emailChecked = false;

	isValidFields: boolean = true
	isPhoneValid: boolean = false
	isEmailValid: boolean = false
	showSubmit: boolean = this.isPhoneValid && this.isEmailValid
	showNext = true
	email = ""
	phonenumber = ""
	private newAttribute: string = "";



	

	

	ngOnInit(): void {
		this.fieldArray.push("Bouwfonds")
		this.fieldArray.push("Evenement")
	}








	


}

class QRRequestBody {
	generic: boolean;
	email: string;
	phoneNumber: string;
	collectGoals: string[];
}
