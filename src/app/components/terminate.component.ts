import { OnInit, Component } from "../../../node_modules/@angular/core";
import { TranslateService } from "../../../node_modules/ng2-translate";
import { DataService } from "../services/data.service";

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

    constructor(private translateService: TranslateService, private dataService: DataService) {
        this.terminateState = TerminateState.Undecided;
    }

    terminate() {
        this.terminateState = TerminateState.Terminated;
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