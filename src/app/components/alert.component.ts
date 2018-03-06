/**
 * Created by lenniestockman on 11/09/2017.
 */
import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { TranslateService } from "ng2-translate";
import {DataService} from "../services/data.service";

@Component({
  selector: 'my-alert',
  templateUrl: '../html/alert.component.html',
  styleUrls: ['../css/alert.component.css']
})

export class AlertComponent implements OnInit {
  ngOnInit(){
  }

  shouldIShowAlert = false;

  constructor(private translate: TranslateService, private dataService: DataService){
	  this.shouldShowAlert();
  }

  hideAlert() {
  	this.shouldIShowAlert = false;
  	this.dataService.writeData("ForceHideChromeAlert", true);
  }

  shouldShowAlert()
  {
  	if(this.dataService.getData("ForceHideChromeAlert") != undefined) {
  	    this.shouldIShowAlert = false;
  	    return
    }

    const isChromium = window['chrome'],
      winNav = window.navigator,
      vendorName = winNav.vendor,
      isOpera = winNav.userAgent.indexOf('OPR') > -1,
      isIEedge = winNav.userAgent.indexOf('Edge') > -1,
      isIOSChrome = winNav.userAgent.match('CriOS');

    let iOS = !!navigator.platform && /iPhone|iPod/.test(navigator.platform);
    let isAndroid = /(android)/i.test(navigator.userAgent);
    if (isIOSChrome || iOS || isAndroid) {
	    this.shouldIShowAlert = false;
    } else if (isChromium !== null && isChromium !== undefined && vendorName === 'Google Inc.' && isOpera === false && isIEedge === false) {
    	this.shouldIShowAlert = false;
    } else {
	    this.shouldIShowAlert = true;

    }
  }
}
