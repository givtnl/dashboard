/**
 * Created by lenniestockman on 23/05/2017.
 */

import {Component, OnInit, OnChanges, Attribute, ViewEncapsulation, Renderer2, ElementRef} from '@angular/core';
import { DatePipe } from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
//import { BrowserAnimationsModule } from '@angular/animations';
import { ApiClientService } from "app/services/api-client.service";
import { TranslateService } from "ng2-translate";
import {CalendarModule, ScheduleModule } from "primeng/primeng";
import {Collection} from "../models/collection";
import {DataService} from "../services/data.service";
import { ViewChild,ChangeDetectorRef } from '@angular/core';

import 'fullcalendar';
import 'fullcalendar/dist/locale/nl';
declare var moment: any;
declare var jQuery: any;

import {forEach} from "@angular/router/src/utils/collection";
@Component({
  selector: 'app-assign-collects',
  templateUrl: '../html/assign.component.html',
  styleUrls: ['../css/assign.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AssignComponent implements OnInit, OnChanges {
  events: any[];
  headerConfig: any;
  options: Object = new Object();

  collectName = '';
  collectName2 = '';
  collectName3 = '';
  isDialogOpen: boolean;
  selected: Object = new Object();
  isMultipleCollects: boolean = false;
  showForm = true;
  showDelete = false;
  event: MyEvent = new MyEvent();
  eventDates: MyEvent = new MyEvent();
  idGen: number = 100;
  schedule: any;
  errorShown: boolean;
  errorMessage: string;
  days = new Array();
  cells = new Array();
  currentViewStart: any;
  currentViewEnd: any;

  @ViewChild('calendar') calendar: ElementRef;
  public constructor(private ts: TranslateService, private cd: ChangeDetectorRef, private renderer: Renderer2, private elementRef:ElementRef, private apiService: ApiClientService) {
    console.log("hello");
  }

  ngOnChanges(): void{
    console.log("changé");
  }

  ngOnInit(): void {
    this.events = [];
    this.headerConfig = {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay'
    };
    this.options['viewRender'] = function(view, element) {
      this.currentViewStart = view.start['_d'].toISOString();
      this.currentViewEnd = view.end['_d'].toISOString();
      this.getAllocations();
      this.checkAllocations();
    }.bind(this);
    this.options['nowIndicator'] = false;
    this.options['locale'] = this.ts.currentLang;
    this.options['eventDurationEditable'] = false;
    this.options['eventStartEditable'] = false;
    this.options['selectHelper'] = false;
    this.options['fixedWeekCount'] = false;
    this.options['editable'] = true;
    this.options['unselectAuto'] = false;
    this.options['selectable'] = true;
    this.options['select'] = function(start, end, jsEvent, view, resource) {
      this.isDialogOpen = true;
      this.showForm = true;
      this.eventDates.start = start;
      this.eventDates.end = end;
    }.bind(this);
  }

  checkAllocations(){
    let apiUrl = 'OrgAdminView/AllocationCheck';
    if(this.currentViewStart !== null && this.currentViewEnd !== null){
      apiUrl += "?dtBegin=" + this.currentViewStart + "&dtEnd=" + this.currentViewEnd;
    }
    this.apiService.getData(apiUrl)
      .then(resp => {
        console.log(resp);
        let dayArray = document.getElementsByClassName('fc-day');
        for(let i = 0; i < dayArray.length; i++){
          let color = "rgb(213, 61, 76)";
          if(dayArray[i]['style'].backgroundColor === color){
            dayArray[i].setAttribute("style","");
          }
        }
        for(let x = 0; x < resp.length; x++){
          let respDate = this.formatDate(new Date(Date.parse(resp[x].Timestamp)));
          for(let y = 0; y < dayArray.length; y++){
            let element = dayArray[y];
            let dayDate = element['dataset']['date'];
            if(respDate === dayDate) {
              element.setAttribute("style", "background-color:#D53D4C;");
            }
          }
        }
      });
  }

  formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  dayRender(e:any, cell:any) {
    //console.log(e);
    let today = new Date();
    let end = new Date();
    let day  = today.getDate();
    end.setDate(day + 7);
  }

  updateEvent()
  {
    if (this.collectName === '') return;
    this.saveEvent(this.collectName, '1');

    this.showForm = false;
    this.isDialogOpen = false;

    if(this.isMultipleCollects){
      if(this.collectName2 === '') return;
      this.saveEvent(this.collectName2, '2');
      if(this.collectName3 === '') return;
      this.saveEvent(this.collectName3, '3');
    }
  }

  selectType(b: boolean){
    this.isMultipleCollects = b;
    this.showForm = true;
  }

  clearAll(){
    this.isMultipleCollects = false;
    this.showForm = false;
    this.showDelete = false;
    this.isDialogOpen = false;
    this.event = new MyEvent();
  }

  handleDayClick(event) {
    this.event = new MyEvent();
    this.event.start = event.date.format();

    //trigger detection manually as somehow only moving the mouse quickly after click triggers the automatic detection
    this.cd.detectChanges();
  }

  handleEventClick(e) {
    this.showForm = false;
    this.isDialogOpen = true;
    this.showDelete = true;
    this.event = new MyEvent();
    this.event.title = e.calEvent.title;
    console.log(e);
    let start = e.calEvent.start;
    let end = e.calEvent.end;
    if(e.view.name === 'month') {
      start.stripTime();
    }

    if(end) {
      end.stripTime();
      this.event.end = end.format();
    }

    this.event.id = e.calEvent.id;
    this.event.start = start.format();
  }

  saveEvent(title: string, collectId: string) {
    let event = new MyEvent();
    event.id = this.idGen++;
    event.title = title;
    event.collectId = collectId;
    event.start = this.eventDates.start;
    event.end = this.eventDates.end;
    this.events.push(event);
    this.saveAllocation(title, collectId);
  }

  deleteEvent() {
    let index: number = this.findEventIndexById(this.event.id);
    if(index >= 0) {
      this.events.splice(index, 1);
    }
    this.deleteAllocation();
    this.event = new MyEvent();
    this.clearAll();
    //this.dialogVisible = false;
  }

  findEventIndexById(id: number) {
    let index = -1;
    for(let i = 0; i < this.events.length; i++) {
      if(id === this.events[i].id) {
        index = i;
        break;
      }
    }

    return index;
  }
  toggleError(setVisible: boolean, msg: any = "") {
    this.errorShown = setVisible;
    this.errorMessage = msg;
  }

  getAllocations(dtStart:any = null,dtEnd: any = null){
    let apiUrl = 'OrgAdminView/Allocation';
     if(this.currentViewStart !== null && this.currentViewEnd !== null){
       apiUrl += "?dtBegin=" + this.currentViewStart + "&dtEnd=" + this.currentViewEnd;
     }
    return this.apiService.getData(apiUrl)
      .then(resp => {
          this.events.length = 0;
          for(let i = 0; i < resp.length; i++) {
            let event = new MyEvent();
            event.id = resp[i]['Id'];
            event.title = resp[i]['Name'];
            event.start = moment().format(resp[i]['dtBegin']);
            event.end = moment().format(resp[i]['dtEnd']);
            event.collectId = resp[i]['CollectId'];
            this.events.push(event);
          }
        })
      .catch(err => console.log(err));
  }

  saveAllocation(title: string, collectId: string){
   // console.log(this.event);
    let body = new Object();
    body["name"] = title;
    body["dtBegin"] = this.eventDates.start['_d'];
    body["dtEnd"] = this.eventDates.end['_d'];
    body["CollectId"] = collectId;
    //https://givtapidebug.azurewebsites.net/api/OrgAdminView/Allocation
    this.apiService.postData("OrgAdminView/Allocation", body)
      .then(resp => {
       // console.log("hello");
        if(resp.status === 409){
          this.toggleError(true, "Je zit met een overlapping");
        }
        this.getAllocations();
        this.checkAllocations();
      })
      .catch(err => {console.log(err); console.log("err")});

    this.event = new MyEvent();
  }

  deleteAllocation(){
    this.apiService.deleteData('OrgAdminView/Allocation?Id=' + this.event.id)
      .then(resp => { console.log(resp); this.checkAllocations(); })
      .catch(err => console.log(err));
  }

  eventRender(event: any, element: any, view: any){
  //  element[0].innerText = event.title + " (" + event.collectId  + ")";
    element[0].innerText = event.title;
  }


}

export class MyEvent {
  id: number;
  title: string;
  start: any;
  end: any;
  collectId: string;
  backgroundColor: string;
}
