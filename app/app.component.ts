import { Component } from '@angular/core';

import {TranslateService} from 'ng2-translate';
@Component({
    selector: 'my-app',
    templateUrl: 'app/html/app.component.html'
})
export class AppComponent  {
    constructor(translate: TranslateService) {
        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang('nl');

        //supported languages todo: add languages you wish to support
        translate.addLangs(["nl","en"]);

        let browserLanguage = navigator.language.substr(0,2);
        if(browserLanguage in translate.getLangs()){
            translate.use(browserLanguage);
        } else {
            //fallbacklanguage
            translate.use('nl');
        }

    }
}
