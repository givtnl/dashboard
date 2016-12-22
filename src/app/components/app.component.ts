import { Component } from '@angular/core';

import {TranslateService} from 'ng2-translate';
import {DataService} from "../services/data.service";
@Component({
  selector: 'app-root',
  templateUrl: '../html/app.component.html'
})
export class AppComponent  {

  dataService: DataService;

  constructor(translate: TranslateService,dataService: DataService) {
    this.dataService = dataService;

    //supported languages todo: add languages you wish to support
    translate.addLangs(["nl","en"]);

    let languages = translate.getLangs();
    let browserLanguage = navigator.language.substr(0,2);
      if(languages.indexOf(browserLanguage) !== -1){
          translate.use(browserLanguage);
      } else {
          translate.use("nl");
      }
  }
}
