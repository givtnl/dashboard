import { OnInit, Component } from "../../../node_modules/@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { DataService } from "../services/data.service";
import { ActivatedRoute} from '@angular/router';
import { ApiClientService } from "../services/api-client.service";

@Component({
    selector: 'terminate-component',
    templateUrl: '../html/terminate.component.html',
    styleUrls: ['../css/terminate.component.css']
  })
export class TerminateComponent implements OnInit {
    TerminateState = TerminateState;
    terminateState: TerminateState = TerminateState.Undecided;

    params: any
    
    terminateUndecided: string

    ngOnInit() {
        this.terminateState = TerminateState.Undecided
        let token = this.route.snapshot.queryParams["token"]
        this.params = JSON.parse(atob(token))
        this.translateService.get("TerminateUndecided_WillRemove").subscribe((res) => {
            this.terminateUndecided = res.replace("{0}", `<span class="text--fat">${this.params.email}</span>`)
        });
    }

    constructor(private translateService: TranslateService, private dataService: DataService, private apiClientService: ApiClientService, private route : ActivatedRoute) {
        this.terminateState = TerminateState.Undecided;
    }

    terminate() {
        this.apiClientService.delete("v2/users/" + this.params.guid + "?token=" + encodeURIComponent(this.params.token))
        .then( resp => {
            this.terminateState = TerminateState.Terminated;
        }).catch(resp => {
            if(resp.status == 404) {
                this.translateService.get("UserNotFoundException").subscribe((res) => alert(res))
            } else {
                this.translateService.get("WoopsContactSupport").subscribe((res) => alert(res))
            }
        });
    }

    cancelTerminate() {
        this.terminateState = TerminateState.CancelledTermination
    }
}

export enum TerminateState {
    Undecided,
    Terminated,
    CancelledTermination 
}