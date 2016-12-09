import { Component, OnInit } from '@angular/core';

import { UserService } from 'app/services/user.service';
import {Router} from "@angular/router";
import {TranslateService} from "ng2-translate";
import {ApiClientService} from "../services/api-client.service";


@Component({
    selector: 'my-navigation',
    templateUrl: '../html/navigation.component.html',
    styleUrls: ['../css/navigation.component.css']
})
export class NavigationComponent implements OnInit {
    instance_title: string;

    text_dashboard: string;
    text_collects: string;
    text_logout: string;

    constructor(private userService: UserService, private router: Router, private translate:TranslateService, private apiService:ApiClientService){
        //this.instance_title = "...";
        this.apiService.getData('OrgAdminView/Org')
            .then(res => {
                //console.log(res);
                this.instance_title = res;
        })
        this.translate.get("Menu_Overview").subscribe(value => {this.text_dashboard = value;})
        this.translate.get("Menu_Collectes").subscribe(value => {this.text_collects = value;})
        this.translate.get("Text_Logout").subscribe(value => {this.text_logout = value;})
    }

    ngOnInit(){
        /*this.apiService.getData('OrgAdminView/Org')
            .then(res => {
                console.log(res);
                this.instance_title = res;
        })*/
    }

    logout(){
        this.userService.logout();
        this.router.navigate(['']);
    }
}
