import { OnInit, Component } from "../../../node_modules/@angular/core";
import { TranslateService } from "../../../node_modules/ng2-translate";
import { DataService } from "../services/data.service";
import {Router, ActivatedRoute} from '@angular/router';
import { ApiClientService } from "../services/api-client.service";

@Component({
    selector: 'terminate',
    templateUrl: '../html/terminate.component.html',
    styleUrls: ['../css/terminate.component.css']
})
export class TerminateComponent implements OnInit {
    TerminateState = TerminateState;
    terminateState: TerminateState = TerminateState.Undecided;

    params: any

    ngOnInit() {
        this.terminateState = TerminateState.Undecided
        let token = this.route.snapshot.queryParams["token"]
        this.params = JSON.parse(atob(token))
    }

    constructor(private translateService: TranslateService, private dataService: DataService, private apiClientService: ApiClientService, private route : ActivatedRoute) {
        this.terminateState = TerminateState.Undecided;
    }

    terminate() {
        this.apiClientService.delete("v2/users/" + this.params.guid + "?token=" + this.params.token)
        .then( resp => {
            this.terminateState = TerminateState.Terminated;
        }).catch( resp => {
            this.translateService.get("WoopsContactSupport").subscribe((res) => alert(res))
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