import { Component, OnInit } from '@angular/core';

import {Router} from "@angular/router";
import {TranslateService} from "ng2-translate";


@Component({
    selector: 'my-footer',
    templateUrl: '../html/footer.component.html',
    styleUrls: ['../css/footer.component.css']
})
export class FooterComponent implements OnInit {
    isChrome =  this.checkChrome();

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

    constructor(private router: Router, private translate: TranslateService) {
    }

    ngOnInit() {
    }
}
