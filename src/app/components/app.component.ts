import { Component, ViewEncapsulation } from '@angular/core';

import {TranslateService} from 'ng2-translate';
@Component({
  selector: 'app-root',
  templateUrl: '../html/app.component.html'
})
export class AppComponent  {
  constructor(translate: TranslateService) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('nl');

    //supported languages todo: add languages you wish to support
    translate.addLangs(["nl","en"]);

    let languages = translate.getLangs();
    let browserLanguage = navigator.language.substr(0,2);
    for(let lang in languages){
      if(languages[lang] === browserLanguage){
        translate.use(languages[lang]);
      }else{
        translate.use("nl");
      }
    }
  }
}
