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
    instance_title: string;
    dataService: DataService;
    userService: UserService;

    showMandateLink = false;

    constructor(userService: UserService, private router: Router, private translate: TranslateService, dataService: DataService, private apiService: ApiClientService) {
      this.dataService = dataService;
      this.userService = userService;
    }

    ngOnInit() {
        let title = this.dataService.getData("instanceTitle");
        this.showMandateLink = this.userService.SiteAdmin;


        if(!title){
            return this.apiService.getData('OrgAdminView/Org')
                .then(res => {
                    this.instance_title = res;
                    this.dataService.writeData("instanceTitle", res);
                  //  return res;
                }).catch(err => console.log(err));
        }
        else{
                this.instance_title = title;
        }
    }

    logout(){
        this.userService.logout();
        this.router.navigate(['']);
    }
}
