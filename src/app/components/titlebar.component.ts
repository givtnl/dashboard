import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {UserService} from "../services/user.service";
import {sharedStylesheetJitUrl} from "@angular/compiler";
import {postcssArgs} from "@angular/cli/tasks/eject";
import {current} from "codelyzer/util/syntaxKind";


@Component({
  selector: 'my-titlebar',
  templateUrl: '../html/titlebar.component.html',
  styleUrls: ['../css/titlebar.component.css']
})
export class TitlebarComponent implements OnInit {
  userService: UserService;
  isDropDownOpen = false;

  currentCollectGroup: any = {Name: "", GUID: ""};
  collectGroups: Array<any> = null;

  currentUrl = "";

  constructor(userService: UserService, private router: Router) {
    this.userService = userService;
  }

  ngOnInit() {
    if ((!this.userService.CollectGroups || this.userService.CollectGroups.length === 0) && this.userService.GivtOperations) {
      var cg = {Name: "Administratie", GUID: ""};
      this.collectGroups = [cg]
      this.currentCollectGroup = cg;
    }
    else {
      if (this.userService.CurrentCollectGroup) {
        this.collectGroups = this.userService.CollectGroups;
        this.currentCollectGroup = this.userService.CurrentCollectGroup;
      }
    }
  }
  setCollectGroup(cg) {
    this.userService.changeCollectGroup(cg);
    this.currentCollectGroup = cg;
    this.isDropDownOpen = !this.isDropDownOpen;
    this.currentUrl = this.router.url;
  }
  toggleDropdown(){
    this.isDropDownOpen = !this.isDropDownOpen;
  }
}
