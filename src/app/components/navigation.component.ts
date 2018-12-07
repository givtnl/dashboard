import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UserService } from 'app/services/user.service';
import {Router} from "@angular/router";
import {ApiClientService} from "../services/api-client.service";
import {DataService} from "../services/data.service";
import {TranslateService} from "ng2-translate";
import * as pkg from '../../../package.json';
import { environment } from '../../environments/environment';

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
    versionNumber = "";

    constructor(private apiService: ApiClientService, private dataService: DataService, userService: UserService, private router: Router, private translate: TranslateService) {
      this.userService = userService;

	    this.userService.collectGroupChanged.subscribe(() => {
		    this.ngOnInit();
	    });
	    this.showCelebrations = this.userService.showCelebrations;
	    this.userService.showCelebrationChanged.subscribe(() => {
		    this.showCelebrations = this.userService.showCelebrations;
      });
    }

    ngOnInit() {
      if (!environment.production) this.versionNumber = pkg['version'];
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
              if(!this.currentCollectGroup.Celebrations){
                this.showCelebrations = false;
            }
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
