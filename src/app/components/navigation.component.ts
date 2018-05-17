import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UserService } from 'app/services/user.service';
import {Router} from "@angular/router";
import {forEach} from "@angular/router/src/utils/collection";
import {childOfKind} from "tslint";
import {ApiClientService} from "../services/api-client.service";
import {DataService} from "../services/data.service";

@Component({
    selector: 'my-navigation',
    templateUrl: '../html/navigation.component.html',
    styleUrls: ['../css/navigation.component.css']
})
export class NavigationComponent implements OnInit {
    userService: UserService;
    huidigJaar = new Date().getFullYear().toString();
    showMandateLink = false;
    showDashboardItems = true;
    toggleSidebar = false;
    currentCollectGroup: any = {Name:"", GUID:""};
    collectGroups : Array<any> = null;
    showCelebrations = false;
    constructor(private apiService: ApiClientService, private dataService: DataService, userService: UserService, private router: Router) {
      this.userService = userService;

	    this.userService.collectGroupChanged.subscribe(() => {
		    this.ngOnInit();
	    });
    }

    ngOnInit() {
      this.showMandateLink = this.userService.GivtOperations;
      this.huidigJaar = this.huidigJaar;
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

      this.loadCelebration();

    }

	loadCelebration() {
		let currentCollectGroup = this.dataService.getData("CurrentCollectGroup");
		if (currentCollectGroup) {
			let guid = JSON.parse(currentCollectGroup).GUID;
			this.apiService.getData('v2/collectgroups/celebration/' + guid)
				.then(resp => {
					if(resp.Celebrations != null) {
						this.showCelebrations = resp.Celebrations;
					}
				})
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
