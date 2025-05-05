import { Component } from '@angular/core';
import {TranslateService} from "ng2-translate";
import {DataService} from "../services/data.service";

@Component({
  selector: 'app-root',
  templateUrl: '../html/app.component.html',
  styleUrls: ['../css/app.component.css']
})
export class AppComponent {

  constructor(private translate: TranslateService, private dataService: DataService) {
    //supported languages todo: add languages you wish to support
    translate.addLangs(["nl","en","de"]);

    let languages = translate.getLangs();
    let browserLanguage = navigator.language.substr(0,2);
    if(languages.indexOf(browserLanguage) !== -1){
      translate.use(browserLanguage);
    } else {
      translate.use("en");
    }
  }
}
