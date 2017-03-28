/**
 * Created by Lennie on 28/03/2017.
 */
import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { UserService } from 'app/services/user.service';
import {Router, ActivatedRoute} from '@angular/router';
import {TranslateService} from 'ng2-translate';

@Component({
    selector: 'mandate',
    templateUrl: '../html/mandate.component.html',
    styleUrls: ['../css/mandate.component.css']
})