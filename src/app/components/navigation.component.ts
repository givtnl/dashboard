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
    constructor(private userService: UserService, private router: Router, private translate:TranslateService, dataService: DataService){
        this.dataService = dataService;

        let that = this;
        if(this.dataService.instanceTitle){
            this.instance_title = this.dataService.instanceTitle;
        }else{
            this.dataService.getInstanceTitle().then(function (value) {
                that.instance_title = value;
            })
        }
    }

    ngOnInit(){

    }

    logout(){
        this.userService.logout();
        this.router.navigate(['']);
    }
}
