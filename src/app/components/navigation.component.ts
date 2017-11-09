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
    instance_title: string = "";
    dataService: DataService;
    userService: UserService;

    showMandateLink = false;

    collectGroups = new Array();
    constructor(userService: UserService, private router: Router, private translate: TranslateService, dataService: DataService, private apiService: ApiClientService) {
      this.dataService = dataService;
      this.userService = userService;
    }

    ngOnInit() {
      let currCollectGroup = this.dataService.getData("currentCollectGroup");

        if(this.dataService.getData("currentCollectGroup") != undefined) {
          this.instance_title = JSON.parse(currCollectGroup).name
        }

        this.showMandateLink = this.userService.SiteAdmin;

        if(this.dataService.getData("CollectGroupAdmin") != undefined) {
          this.collectGroups = JSON.parse(this.dataService.getData("CollectGroupAdmin"));
          console.log(this.collectGroups);
          //console.log(this.collectGroups.count());
          console.log(this.collectGroups.length);
          for(let x in this.collectGroups) {
            console.log(this.collectGroups[x].id);
            console.log(this.collectGroups[x].name);
          }

        }

        if(this.instance_title == ""){
            return this.apiService.getData('CollectGroupView/CollectGroup')
                .then(res => {
                  this.collectGroups = res;

                  let item;
                  let items= [];
                  for (let o in this.collectGroups) {
                    item = {id: o, name: this.collectGroups[o]};
                    items.push(item);
                  }
                  this.collectGroups = items;
                  this.dataService.writeData("CollectGroupAdmin", JSON.stringify(items));

                  this.dataService.writeData("currentCollectGroup",JSON.stringify(item));
                  this.instance_title = item.name;
                }).catch(err => console.log(err));
        }



    }

    setCollectGroup(cg) {
      this.dataService.writeData("currentCollectGroup", JSON.stringify(cg));
      this.instance_title = cg.name;
    }

    logout(){
        this.userService.logout();
        this.router.navigate(['']);
    }
}
