import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UserService } from 'app/services/user.service';
import {Router} from "@angular/router";
import {forEach} from "@angular/router/src/utils/collection";
import {childOfKind} from "tslint";

@Component({
    selector: 'my-navigation',
    templateUrl: '../html/navigation.component.html',
    styleUrls: ['../css/navigation.component.css']
})
export class NavigationComponent implements OnInit {
    userService: UserService;

    showMandateLink = false;
    showDashboardItems = true;
    toggleSidebar = false;
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

    logout(){
        this.userService.logout();
        this.router.navigate(['']);
    }

    toggleFullSidebar(){
      this.toggleSidebar = ! this.toggleSidebar;
      let sidebar = document.getElementById('sidebar');
      let sidebarList = document.getElementsByClassName("sidebar-title");
      let sidebarGivtLogo = document.getElementById("givt-sidebar-logo");
      if(this.toggleSidebar){
        for(let i = 0; i < sidebarList.length; ++i){
          sidebar.setAttribute('style','width: 141px; padding-right: 20px');
          sidebarList[i].setAttribute('style', 'display:inline-block !important;');
        }
      }
      else {
        for(let i = 0; i < sidebarList.length; ++i){
          sidebar.setAttribute('style','width: 52px; padding-right: 0px');
          sidebarList[i].setAttribute('style', 'display:none !important');
        }
      }

    }
}
