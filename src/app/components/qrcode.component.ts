import { Component, OnInit } from "@angular/core";
import { ApiClientService } from "../services/api-client.service";
import { DataService } from "../services/data.service";
import { ISODatePipe } from "../pipes/iso.datepipe";
import { UserService } from "app/services/user.service";
import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";
import { Router } from '@angular/router';

@Component({
	selector: 'qr-code',
	templateUrl: '../html/qrcode.component.html',
	styleUrls: ['../css/qrcode.component.css']
})
export class QRCodeComponent implements OnInit {

	currentQuestionId = 1
	isChecked = false
	constructor(private apiService: ApiClientService, private dataService: DataService, private datePipe: ISODatePipe, private router:Router) {

	}

	private fieldArray: Array<{ value: string, placeholder: string }> = [];
	private newAttribute: any = { placeholder: "Nieuw Collectedoel" };

	addFieldValue() {
		this.fieldArray.push(this.newAttribute)
		this.newAttribute = { placeholder: "Nieuw Collectedoel" };
	}

	deleteFieldValue(index) {
		this.fieldArray.splice(index, 1);
	}

	ngOnInit(): void {
		this.fieldArray.push({ value: "Bouwfonds", placeholder: "" })
		this.fieldArray.push({ value: "Evenement", placeholder: "" })
	}

	showNextQuestion() {
		this.currentQuestionId++
	}

	showPreviousQuestion() {
		this.currentQuestionId--
	}

	checkboxClicked() {
		this.isChecked = !this.isChecked
	}

	goHome() {
		this.router.navigateByUrl('/');
	}

	skipToEnd() {
		this.currentQuestionId = 4;
	}

	submit() {
		var currentValue = (<HTMLInputElement> document.getElementById('phonenumber')).value;

		

	}

	keyPressPhonenumber(event: any) {
		const pattern = /[0-9\+\-\ ]/;
	
		let inputChar = String.fromCharCode(event.charCode);
		if (event.keyCode != 8 && !pattern.test(inputChar)) {
		  event.preventDefault();
		}
	  }

}
