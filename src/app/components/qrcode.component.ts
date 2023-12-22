/* tslint:disable:indent */
import { Component, OnInit } from "@angular/core";
import { ApiClientService } from "../services/api-client.service";
import { DataService } from "../services/data.service";
import { UserService } from "../services/user.service";
import { TranslateService } from "@ngx-translate/core";
import { LoggingService } from "../services/logging.service";
import { QrCodeType } from "../models/qr-code-type.enum";
import { CollectionMediumType } from "../models/collectionMediumType";

@Component({
	selector: 'qr-code',
	templateUrl: '../html/qrcode.component.html',
	styleUrls: ['../css/qrcode.component.css']
})
export class QRCodeComponent implements OnInit {
	public selectedLanguage: string;
	public loading = false;
	constructor(
		private translateService: TranslateService,
		private apiService: ApiClientService,
		private dataService: DataService,
		private userService: UserService,
		private logginService: LoggingService) {

	}
	public name = "";
	GenericQR = false;
	currentQuestionId = 0;
	fieldArray: string[] = [""];
	giftPurposes: string[] = [];
	isEmailValid = true;

    allQrCodes = [];
	qrCodes = [];
    qrCodeToDelete;
	email = this.dataService.getData('UserEmail');
	phonenumber = "";
	comments = "";

	ngOnInit(): void {
		this.loading = true;
		this.apiService.getData(`v2/organisations/${this.userService.CurrentCollectGroup.OrgId}/collectgroups/${this.userService.CurrentCollectGroup.GUID}/collectionmediums?collectionMediumTypes=${CollectionMediumType.QrCodeDefault}`)
			.then(resp => {
				this.logginService.info("Succesfully fetched qr code list");
				this.allQrCodes = resp;
                this.qrCodes = this.allQrCodes.filter(code => code.Active === true);
				this.loading = false;
			}).catch((error) => this.handleError(error));

		let savedLanguage = this.dataService.getData("SelectedQRCodeLanguage");
		if (!savedLanguage || savedLanguage.length === 0) {
			let currentCollectGroupCountry = this.userService.CurrentCollectGroup.Country;
			savedLanguage = (currentCollectGroupCountry === "NL" || currentCollectGroupCountry == "BE") ? "NL" : "EN";
		}
		if (!this.isNullOrUndefined(savedLanguage) && savedLanguage.length == 2) {
			this.selectedLanguage = savedLanguage;
			this.logginService.info("Set language in QR component from Local storage");
		}
		else if (!this.isNullOrUndefined(navigator.language)) {
			this.selectedLanguage = navigator.language.substring(0, 2);
			this.logginService.info("Set language in QR component from navigator");

		}

		this.userService.collectGroupChanged.subscribe(() => {
			this.ngOnInit();
		});
	}

	async submitBatch() {
		this.logginService.info("Submitting batch QR Request");
		this.loading = true;
		let body = { commands: [] };
		body.commands = this.fieldArray.map(x => { return { allocationName: x, CollectionMediumType:  QrCodeType.Default }; });
		await this.apiService.postData(`v2/organisations/${this.userService.CurrentCollectGroup.OrgId}/collectgroups/${this.userService.CurrentCollectGroup.GUID}/collectionmediums/${this.selectedLanguage.toLowerCase()}/batch`, body)
			.then(response => {
				if (!this.isNullOrUndefined(response))
					this.downloadZip(response.Base64Result, "");
				else
					this.handleError(`Batch: couldnt get qr codes bacause response was null or undefined.`);
			}).catch((error) => {
				this.handleError(error);
			});
	}

	async submitGeneric() {
		this.logginService.info("Submitting generic QR Request");

		this.loading = true;
		let body = { AllocationName: null, CollectionMediumType: QrCodeType.Default };
		await this.apiService.postData(`v2/organisations/${this.userService.CurrentCollectGroup.OrgId}/collectgroups/${this.userService.CurrentCollectGroup.GUID}/collectionmediums`, body)
			.then(async response => {
				let mediumId = response.Result;
				if (!this.isNullOrUndefined(mediumId)) {
					this.apiService.getData(`v2/organisations/${this.userService.CurrentCollectGroup.OrgId}/collectgroups/${this.userService.CurrentCollectGroup.GUID}/collectionmediums/${mediumId}/export/${this.selectedLanguage.toLowerCase()}`)
						.then(response2 => {
							if (!this.isNullOrUndefined(response2))
								this.downloadZip(response2.Base64Result);
							else
								this.handleError(`Couldnt get QR code from response because response is null or undefined`);
						}).catch((error) => {
							this.handleError(error);
						});
				} else {
					this.handleError(`Couldn't get medium id from response: ${response}`);
				}
			}).catch((error) => {
				this.handleError(error);
			});
	}

    showModalForDelete(qrcode) {
        this.currentQuestionId = -1;
        this.qrCodeToDelete = qrcode;
    }

    cancelDelete() {
        this.currentQuestionId = 0;
        this.qrCodeToDelete = null;
    }

    deleteQrcode() {
        this.loading = true;
        let body = { MediumId: this.qrCodeToDelete.MediumId, Active: false };
        this.apiService.putData(`v2/organisations/${this.userService.CurrentCollectGroup.OrgId}/collectgroups/${this.userService.CurrentCollectGroup.GUID}/collectionmediums`, body)
            .then(response => {
                if (!this.isNullOrUndefined(response)) {
                    this.qrCodes = this.qrCodes.filter((code) => {return code.MediumId !== this.qrCodeToDelete.MediumId;});
                    this.qrCodeToDelete = null;
                    this.loading = false;
                }
                else
                    this.handleError(`Couldn't delete qrCode because response was null`);
            });
        this.currentQuestionId = 0;
    }

	flowGeneric() {
		this.GenericQR = true;
		let respsonse;
		this.translateService.get("QRCodeREQ_generic").subscribe((res) => respsonse = res);
		this.fieldArray = [String(respsonse)];
		this.submitGeneric();
		this.showNextQuestion(2);
	}

	saveLanguageAndContinue(): void {
		this.dataService.writeData("SelectedQRCodeLanguage", this.selectedLanguage, true);
		this.showNextQuestion(1);
	}
	flowSpecific() {
		this.GenericQR = false;
		this.showNextQuestion(1);
	}

	undoProces() {
		if (this.GenericQR) {
			this.showPreviousQuestion(2);
			this.fieldArray = [""];
		}
		else {
			this.showPreviousQuestion(1);
		}
	}

	showNextQuestion(value: number) {
		switch (this.currentQuestionId) {
			case 2:
				if (this.fieldArray[0] == null) {
					this.fieldArray.push("");
				}
				this.currentQuestionId += value;
				break;
			case 3:

				this.fieldArray = this.fieldArray.filter(element => !this.isNullOrUndefined(element) && element.trim() !== "");

				this.fieldArray.forEach((element, index) => {
					this.fieldArray[index] = element.trim();
				});
				if (this.fieldArray.length > 0) {
					this.currentQuestionId += value;
					this.submitBatch();
				} else {
					console.log(this.fieldArray);
					this.fieldArray.push("");
					console.log(this.fieldArray);
					alert(this.translateService.instant("QRCode_OopsForgotSomething").toString());
				}
				break;
			default:
				this.currentQuestionId += value;
				break;
		}
	}

	showPreviousQuestion(value: number = 1) {
		switch (this.currentQuestionId) {
			case 4:
				if (this.fieldArray[0] == null) {
					this.fieldArray.push("");
				}
				break;

			default:
				break;
		}
		this.currentQuestionId -= value;
	}

	deleteFieldValue(index) {
		this.fieldArray.splice(index, 1);
	}

	trackByFn(index: any, item: any) {
		return index;
	}
	handleError(error) {
		this.translateService.get("Error_Generic").subscribe((translation) => { alert(translation); });
		this.logginService.error(`An error occurred in the QR code flow - ${error}`);
		this.loading = false;
	}

	downloadQr(value: string, name: string) {
		this.loading = true;
		this.apiService.getData(`v2/organisations/${this.userService.CurrentCollectGroup.OrgId}/collectgroups/${this.userService.CurrentCollectGroup.GUID}/collectionmediums/${value}/export/${this.selectedLanguage.toLowerCase()}`)
			.then(response => {
				if (!this.isNullOrUndefined(response))
					this.downloadZip(response.Base64Result, name);
				else
					this.handleError(`Couldnt get list of qr codes because response was null`);
			});
	}

	downloadZip(response: string, name: string = null) {
		try {
			let blob = this.b64toBlob(response, "application/zip", 512);
			let blobUrl = URL.createObjectURL(blob);
			let button = document.getElementById("hiddenQrButton");
			button.setAttribute("href", blobUrl);

			if (name == null)
				name = ` - ${this.translateService.instant("QRCodeREQ_generic").toString()}`;
			else if (name != "") {
				name = ` - ${name}`;
			}

			let fileName = `${this.translateService.instant("QRCodes").toString()} - ${this.userService.CurrentCollectGroup.Name}${name}.zip`;

			button.setAttribute("download", fileName);
			button.click();
			window.URL.revokeObjectURL(blobUrl);
		} catch (error) {
			this.handleError(error);
		}

		this.loading = false;
	}
	b64toBlob(b64Data, contentType, sliceSize) {
		contentType = contentType || '';
		sliceSize = sliceSize || 512;

		let byteCharacters = atob(b64Data);
		let byteArrays = [];

		for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			let slice = byteCharacters.slice(offset, offset + sliceSize);

			let byteNumbers = new Array(slice.length);
			for (let i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}

			let byteArray = new Uint8Array(byteNumbers);

			byteArrays.push(byteArray);
		}

		let blob = new Blob(byteArrays, { type: contentType });
		return blob;
	}

	isNullOrUndefined(value: any): boolean {
		return value === undefined || value === null;
	}
}

class QRRequestBody {
	email: string;
	phoneNumber: string;
	collectGoals: string[];
	comments: string;
}
