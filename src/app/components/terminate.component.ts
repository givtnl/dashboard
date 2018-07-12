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

    ngOnInit() {
        this.terminateState = TerminateState.Undecided
    }

    constructor(private translateService: TranslateService, private dataService: DataService, private apiClientService: ApiClientService, private route : ActivatedRoute) {
        this.terminateState = TerminateState.Undecided;
    }

    terminate() {
        this.terminateState = TerminateState.Terminated;
        let guid = this.route.snapshot.queryParams["guid"];
        let token = this.route.snapshot.queryParams["token"]
        this.apiClientService.delete("v2/users/" + guid + "?token=" + token)
        .then(resp => {
            console.log("User is deleted");
        });
    }

    cancelTerminate() {
        this.terminateState = TerminateState.CancelledTermination;
    }
}

export enum TerminateState {
    Undecided,
    Terminated,
    CancelledTermination 
}