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

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        //todo: set lang according to navigator.language
        translate.use('nl');
    }
}
