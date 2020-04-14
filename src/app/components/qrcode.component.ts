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
import { isNullOrUndefined } from "util";


@Component({
	selector: 'qr-code',
	templateUrl: '../html/qrcode.component.html',
	styleUrls: ['../css/qrcode.component.css']
})
export class QRCodeComponent implements OnInit {

	constructor(private translateService: TranslateService, private apiService: ApiClientService, private dataService: DataService, private datePipe: ISODatePipe, private router: Router, private http: Http, private userService: UserService) {

	}
	ngOnInit(): void {
		this.apiService.getData(`v2/organisations/${this.userService.CurrentCollectGroup.OrgId}/collectgroups/${this.userService.CurrentCollectGroup.GUID}/collectionmediums`)
			.then(resp => {
				this.qrCodes = resp
			});
	}
	public name = ""
	GenericQR: boolean = false
	currentQuestionId: number = 0
	fieldArray: string[] = [""]
	giftPurposes: string[] = []
	isEmailValid: boolean = true

	qrCodes = []
	email = this.dataService.getData('UserEmail')
	phonenumber = ""
	comments = ""
	downloadQr(value: string) {
		this.apiService.getData(`v2/organisations/${this.userService.CurrentCollectGroup.OrgId}/collectgroups/${this.userService.CurrentCollectGroup.GUID}/collectionmediums/${value}/export/nl`)
			.then(resp => {
				//download qr zip
				var blob = this.b64toBlob(resp.Base64Result, "application/zip", 512);
				var blobUrl = URL.createObjectURL(blob);
				var button = document.getElementById("hiddenQrButton");
				button.setAttribute("href", blobUrl);
				button.setAttribute("download", "QrCode")
				button.click();
				window.URL.revokeObjectURL(blobUrl);
			})
	}
	b64toBlob(b64Data, contentType, sliceSize) {
		contentType = contentType || '';
		sliceSize = sliceSize || 512;

		var byteCharacters = atob(b64Data);
		var byteArrays = [];

		for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			var slice = byteCharacters.slice(offset, offset + sliceSize);

			var byteNumbers = new Array(slice.length);
			for (var i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}

			var byteArray = new Uint8Array(byteNumbers);

			byteArrays.push(byteArray);
		}

		var blob = new Blob(byteArrays, { type: contentType });
		return blob;
	}
	showNextQuestion(value: number) {
		switch (this.currentQuestionId) {
			case 2:
				if (this.fieldArray[0] == null) {
					this.fieldArray.push("")
				}
				this.currentQuestionId += value
				break
			case 3:
				this.fieldArray = this.fieldArray.filter(element => !isNullOrUndefined(element) && element.trim() !== "")

				this.fieldArray.forEach((element, index) => {
					this.fieldArray[index] = element.trim()
				})
				this.currentQuestionId += value
				this.submit()
				break
			default:
				this.currentQuestionId += value
				break
		}
	}

	showPreviousQuestion(value: number = 1) {
		switch (this.currentQuestionId) {
			case 4:
				if (this.fieldArray[0] == null) {
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
		var body = { commands: [] }
		body.commands = this.fieldArray.map(x => { return { allocationName: x } });
		console.log(body);
		await this.apiService.postData(`v2/organisations/${this.userService.CurrentCollectGroup.OrgId}/collectgroups/${this.userService.CurrentCollectGroup.GUID}/collectionmediums`, body)
			.then(response => {
				console.log(response);
			})
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
