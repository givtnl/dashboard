import { Component, OnInit } from '@angular/core';

import { UserService } from 'app/services/user.service';
import {Router} from "@angular/router";
import {TranslateService} from "ng2-translate";
import {ApiClientService} from "../services/api-client.service";
import {DataService} from "../services/data.service";


@Component({
    selector: 'my-navigation',
    templateUrl: '../html/navigation.component.html',
    styleUrls: ['../css/navigation.component.css']
})
export class NavigationComponent implements OnInit {
    dataService: DataService;
    userService: UserService;

    showMandateLink = false;

    currentCollectGroup: any = {Name:"", GUID:""};
    collectGroups = new Array();
    constructor(userService: UserService, private router: Router, private translate: TranslateService, dataService: DataService, private apiService: ApiClientService) {
      this.dataService = dataService;
      this.userService = userService;
    }

    ngOnInit() {
      this.showMandateLink = this.userService.SiteAdmin;
        if(this.dataService.getData("currentCollectGroup") != undefined && this.dataService.getData("CollectGroupAdmin") != undefined) {
          this.currentCollectGroup = JSON.parse(this.dataService.getData("currentCollectGroup"));
          this.collectGroups = JSON.parse(this.dataService.getData("CollectGroupAdmin"));
        } else {
          return this.apiService.getData('CollectGroupView/CollectGroup')
            .then(res => {
              this.collectGroups = res;
              this.currentCollectGroup = this.collectGroups[0];
              this.dataService.writeData("CollectGroupAdmin", JSON.stringify(this.collectGroups));
            }).catch(err => console.log(err));
        }
    }

    setCollectGroup(cg) {
      this.dataService.writeData("currentCollectGroup", JSON.stringify(cg));
      this.currentCollectGroup = cg;
    }

    logout(){
        this.userService.logout();
        this.router.navigate(['']);
    }
}
