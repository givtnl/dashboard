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
import { forEach } from "@angular/router/src/utils/collection";
import { forEachChild } from "typescript";
import { Message } from "@angular/compiler/src/i18n/i18n_ast";
import { TranslateService } from "../../../node_modules/ng2-translate";


@Component({
	selector: 'qr-code',
	templateUrl: '../html/qrcode.component.html',
	styleUrls: ['../css/qrcode.component.css']
})
export class QRCodeComponent implements OnInit {

	constructor(private translateService :TranslateService, private apiService: ApiClientService, private dataService: DataService, private datePipe: ISODatePipe, private router: Router, private http: Http, private userService: UserService) {

	}
	public name = "";
	GenericQR: boolean = false;
	currentQuestionId: number = 1;
	fieldArray: string[] = [];
	giftPurposes: string[] = [];
	isPhoneValid: boolean = true
	isEmailValid: boolean = false
	showEmailValid: boolean = true;

	showSend: boolean = this.isPhoneValid && this.isEmailValid
	email = ""
	phonenumber = ""
	private newAttribute: string = "";

	showNextQuestion(value: number) {
		this.currentQuestionId += value;

		switch (this.currentQuestionId) {
			case 4:
				this.fieldArray = this.fieldArray.filter(element => element.trim() !== "");

				this.fieldArray.forEach((element, index) => {
					this.fieldArray[index] = element.trim();
				})
				break;

			case 5:
				
				if (this.showSend) {
					this.showEmailValid = true;
					this.submit();
				} else {
					this.showEmailValid = false;
					this.currentQuestionId -= value;

					this.translateService.get("QRCodeREQ_warning_novalidemail").subscribe((res) => alert(res))

				}
				break;

			default:
				break;
		}
	}
	showPreviousQuestion(value: number = 1) {
		this.currentQuestionId -= value;

		switch (this.currentQuestionId) {
			case 3:
				if(this.fieldArray[0] == null) {
					this.fieldArray.push("")
				} 
				break;

			default:
				break;
		}
	}

	addFieldValue() {
		this.fieldArray.push(this.newAttribute)
	}

	deleteFieldValue(index) {
		this.fieldArray.splice(index, 1);
	}

	trackByFn(index: any, item: any) {
		return index;
	}

	submit() {
		let body: QRRequestBody = { generic: this.GenericQR, email: this.email, phoneNumber: this.phonenumber, collectGoals: this.fieldArray }
		let apiUrl = 'v2/collectgroups/' + this.userService.CurrentCollectGroup.GUID + '/qrcodes';

		this.apiService.postData(apiUrl, body)
			.then(resp => {
				console.log(resp);
			});

	}

	checkEmail() {
		var emailField = <HTMLInputElement>document.getElementById('email')
		this.email = emailField.value;
		const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
		this.isEmailValid = regexp.test(this.email)

		return this.isEmailValid
	}

	checkPhoneNumber() {
		// this.phonenumber = (<HTMLInputElement>document.getElementById('phonenumber')).value;

		// var currentValue = this.phonenumber;
		// if (
		// 	(currentValue.length == 10 && (currentValue.charAt(1) == "6" || currentValue.charAt(1) == "4")) ||
		// 	(currentValue.length == 11 && currentValue.charAt(1) == "7")
		// ) {
		// 	this.isPhoneValid = true
		// } else {
		// 	this.isPhoneValid = false
		// }
		return this.isPhoneValid
	}

	flowGeneric() {
		this.GenericQR = true;
		this.fieldArray = [""];
		this.showNextQuestion(2);
	}

	flowSpecific() {
		this.GenericQR = false;
		this.showNextQuestion(1);
	}

	undoProces() {
		if (this.GenericQR) {
			this.showPreviousQuestion(2);
		}
		else {
			this.showPreviousQuestion(1);
		}
	}

	resetShowEmailValid() {
		console.log("ERROR");
		
		this.showEmailValid = true;
	}

	ngOnInit(): void {
		this.fieldArray.push("")
	}
}

class QRRequestBody {
	generic: boolean;
	email: string;
	phoneNumber: string;
	collectGoals: string[];
}
