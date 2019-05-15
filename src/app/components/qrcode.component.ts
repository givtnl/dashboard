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
export class QRCodeComponent {

	constructor(private translateService :TranslateService, private apiService: ApiClientService, private dataService: DataService, private datePipe: ISODatePipe, private router: Router, private http: Http, private userService: UserService) {

	}
	public name = ""
	GenericQR: boolean = false
	currentQuestionId: number = 1
	fieldArray: string[] = [""]
	giftPurposes: string[] = []
	isPhoneValid: boolean = true
	isEmailValid: boolean = true


	email = this.dataService.getData('UserEmail')
	phonenumber = ""
	comments = ""
	private newAttribute: string = ""

	async showNextQuestion(value: number) {
		switch (this.currentQuestionId) {
			case 2:
				if(this.fieldArray[0] == null) {
					this.fieldArray.push("")
				}
				this.currentQuestionId += value
				break
			case 3:
				this.fieldArray = this.fieldArray.filter(element => element.trim() !== "")

				this.fieldArray.forEach((element, index) => {
					this.fieldArray[index] = element.trim()
				})
				this.currentQuestionId += value
				break
			case 4:
				this.checkEmail()
				this.checkPhoneNumber()

				if (this.isEmailValid && this.isPhoneValid) {				
					var submitok = await this.submit()
					if(submitok==false){
						this.translateService.get("QRCodeREQ_warning_submitfailed").subscribe((res) => setTimeout(() => {alert(res)}, 200))
					} else 
						this.currentQuestionId += value
				} else {
					if(!this.isEmailValid && this.isPhoneValid) {
						this.translateService.get("QRCodeREQ_warning_novalidemail").subscribe((res) => alert(res))
					} else if (this.isEmailValid && !this.isPhoneValid){
						this.translateService.get("QRCodeREQ_warning_novalidphone").subscribe((res) => alert(res))
					} else {
						this.translateService.get("QRCodeREQ_warning_novaliddata").subscribe((res) => alert(res))
					}					
				}
				break
			default:
				this.currentQuestionId += value
				break
		}
	}
	
	showPreviousQuestion(value: number = 1) {
		switch (this.currentQuestionId) {
			case 4:
				if(this.fieldArray[0] == null) {
					this.fieldArray.push("")
				} 
				break

			default:
				break
		}
		this.currentQuestionId -= value
	}

	deleteFieldValue(index) {
		this.fieldArray.splice(index, 1)
	}

	trackByFn(index: any, item: any) {
		return index
	}

	async submit() {

		var submitSuccessfull = false
		let body: QRRequestBody = {email: this.email, phoneNumber: this.phonenumber, collectGoals: this.fieldArray, comments: this.comments}
		let apiUrl = 'v2/collectgroups/' + this.userService.CurrentCollectGroup.GUID + '/qrcodes'

		await this.apiService.postData(apiUrl, body)
			.then(resp => {
				if(Number(resp) > 0) {
					submitSuccessfull = true
				}
			})
			.catch(err => {
				submitSuccessfull = false
			})
		return submitSuccessfull
	}

	checkEmail() {
		var emailField = <HTMLInputElement>document.getElementById('email')
		this.email = emailField.value
		const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
		this.isEmailValid = regexp.test(this.email)

		return this.isEmailValid
	}

	checkPhoneNumber() {
		this.phonenumber = (<HTMLInputElement>document.getElementById('phonenumber')).value

		var currentValue = this.phonenumber
		if (
			(currentValue.length == 10 && (currentValue.charAt(1) == "6" || currentValue.charAt(1) == "4")) ||
			(currentValue.length == 11 && currentValue.charAt(1) == "7")
		) {
			this.isPhoneValid = true
		} else {
			this.isPhoneValid = false
		}
		return this.isPhoneValid
	}

	flowGeneric() {
		this.GenericQR = true
		var respsonse
		this.translateService.get("QRCodeREQ_generic").subscribe((res) => respsonse = res)
		this.fieldArray = [String(respsonse)]
		this.showNextQuestion(2)
	}

	flowSpecific() {
		this.GenericQR = false
		this.showNextQuestion(1)
	}

	undoProces() {
		if (this.GenericQR) {
			this.showPreviousQuestion(2)
			this.fieldArray = [""]
		}
		else {
			this.showPreviousQuestion(1)
		}
	}
}

class QRRequestBody {
	email: string
	phoneNumber: string
	collectGoals: string[]
	comments: string
}
