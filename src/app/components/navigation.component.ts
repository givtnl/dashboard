import { Component, OnInit } from '@angular/core';

import { UserService } from 'app/services/user.service';
import {Router} from "@angular/router";
import {TranslateService} from "ng2-translate";
import {DataService} from "../services/data.service";


@Component({
    selector: 'my-navigation',
    templateUrl: '../html/navigation.component.html',
    styleUrls: ['../css/navigation.component.css']
})
export class NavigationComponent implements OnInit {
    userService: UserService;

    showMandateLink = false;

    currentCollectGroup: any = {Name:"", GUID:""};
    collectGroups : any = [];
    constructor(userService: UserService, private router: Router) {
      this.userService = userService;
    }

    ngOnInit() {
      console.log("nav init");
      this.showMandateLink = this.userService.SiteAdmin;
      console.log(this.userService.CollectGroups);
      console.log(this.userService.CurrentCollectGroup);
      if (this.userService.CurrentCollectGroup) {
          this.collectGroups = JSON.parse(this.userService.CollectGroups);
          this.currentCollectGroup = JSON.parse(this.userService.CurrentCollectGroup);
      }
    }

    setCollectGroup(cg) {
        this.userService.changeCollectGroup(cg);
        this.currentCollectGroup = cg;
    }

    logout(){
        this.userService.logout();
        this.router.navigate(['']);
    }
}
