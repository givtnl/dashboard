import { Component, OnInit } from '@angular/core';

import {Router} from "@angular/router";
import {TranslateService} from "ng2-translate";
import {UserService} from "../services/user.service";


@Component({
    selector: 'my-footer',
    templateUrl: '../html/footer.component.html',
    styleUrls: ['../css/footer.component.css']
})
export class FooterComponent implements OnInit {
    isChrome =  this.checkChrome();
    userService: UserService;
    showMandateLink = false;
    showDashboardItems = true;
    showCelebrations = false;
    constructor(userService: UserService, private router: Router) {
      this.userService = userService;
	    this.showCelebrations = this.userService.showCelebrations;

	    this.userService.showCelebrationChanged.subscribe(() => {
		    this.showCelebrations = this.userService.showCelebrations;
	    });
    }
    checkChrome()
    {
        const isChromium = window['chrome'],
            winNav = window.navigator,
            vendorName = winNav.vendor,
            isOpera = winNav.userAgent.indexOf('OPR') > -1,
            isIEedge = winNav.userAgent.indexOf('Edge') > -1,
            isIOSChrome = winNav.userAgent.match('CriOS');

        if (isIOSChrome) {
            return true;
        } else if (isChromium !== null && isChromium !== undefined && vendorName === 'Google Inc.' && isOpera === false && isIEedge === false) {
            return true;
        } else {
            return false;
        }
    }


    ngOnInit() {
        this.showDashboardItems = true;
	    this.showMandateLink = this.userService.GivtOperations;
    }
}
