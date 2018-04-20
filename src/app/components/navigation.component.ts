import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/services/user.service';
import {Router} from "@angular/router";

@Component({
    selector: 'my-navigation',
    templateUrl: '../html/navigation.component.html',
    styleUrls: ['../css/navigation.component.css']
})
export class NavigationComponent implements OnInit {
    userService: UserService;

    showMandateLink = false;
    showDashboardItems = true;
    isDropDownOpen = false;
    currentCollectGroup: any = {Name:"", GUID:""};
    collectGroups : Array<any> = null;
    constructor(userService: UserService, private router: Router) {
      this.userService = userService;
    }

    ngOnInit() {
      this.showMandateLink = this.userService.GivtOperations;
      if ((!this.userService.CollectGroups || this.userService.CollectGroups.length === 0) && this.userService.GivtOperations) {
          this.showDashboardItems = false;
          var cg = { Name: "Administratie", GUID: "" };
          this.collectGroups = [cg]
          this.currentCollectGroup = cg;
      }
      else {
          this.showDashboardItems = true;
          if (this.userService.CurrentCollectGroup) {
              this.collectGroups = this.userService.CollectGroups;
              this.currentCollectGroup = this.userService.CurrentCollectGroup;
          }
      }
    }

    setCollectGroup(cg) {
        this.userService.changeCollectGroup(cg);
        this.currentCollectGroup = cg;
    }
  toggleDropdown(){
      this.isDropDownOpen = !this.isDropDownOpen;
  }
    logout(){
        this.userService.logout();
        this.router.navigate(['']);
    }
}
