/**
 * Created by lenniestockman on 23/05/2017.
 */

import {Component, OnInit, Attribute, ViewEncapsulation, Renderer2, ElementRef} from '@angular/core';
import { DatePipe } from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
//import { BrowserAnimationsModule } from '@angular/animations';
import { ApiClientService } from "app/services/api-client.service";
import { TranslateService } from "ng2-translate";
import {CalendarModule, ScheduleModule } from "primeng/primeng";
import {Collection} from "../models/collection";
import {DataService} from "../services/data.service";
import { ChangeDetectorRef } from '@angular/core';

import 'fullcalendar';
import 'fullcalendar/dist/locale/nl';
declare var moment: any;
import {forEach} from "@angular/router/src/utils/collection";
@Component({
  selector: 'app-assign-collects',
  templateUrl: '../html/assign.component.html',
  styleUrls: ['../css/assign.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class AssignComponent implements OnInit {
  events: any[];
  headerConfig: any;
  options: Object = new Object();
  locale = { locale: 'nl'};

  collectName = '';
  collectName2 = '';
  collectName3 = '';
  isDialogOpen: boolean;
  selected: Object = new Object();
  isMultipleCollects: boolean = false;
  showForm = false;
  showDelete = false;
  event: MyEvent = new MyEvent();
  eventDates: MyEvent = new MyEvent();
  idGen: number = 100;
  schedule: any;
  errorShown: boolean;
  errorMessage: string;
  public constructor(private cd: ChangeDetectorRef, private renderer: Renderer2, private elementRef:ElementRef, private apiService: ApiClientService) { }

  ngOnInit(): void {
    this.getAllocations();
    //fc-event-container
    this.schedule = $('#calendar');


    /* this.events = [
      {
        "title": "All Day Event",
        "start": "2017-05-23",
        "backgroundColor" : "green"
      }
    ]; */
    this.events = [];
    this.headerConfig = {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay'
    };
    this.options['eventDurationEditable'] = false;
    this.options['eventStartEditable'] = false;
    this.options['selectHelper'] = false;
    this.options['fixedWeekCount'] = false;
    this.options['editable'] = true;
    this.options['unselectAuto'] = false;
    this.options['selectable'] = true;
    this.options['select'] = function(start, end, jsEvent, view, resource) {
      this.isDialogOpen = true;
      this.eventDates.start = start;
      this.eventDates.end = end;
      console.log(jsEvent);
      console.log(start);
      console.log(end);
      console.log(
        'select callback',
        start.format(),
        end.format(),
        resource ? resource.id : '(no resource)'
      );
    }.bind(this);


  }

  dayRender(e:any, cell:any) {
  console.log(e);
  let today = new Date();
  let end = new Date();
  let day  = today.getDate();
  end.setDate(day + 7);
  if(e["_d"].getDate() == 8){
    cell.css("background-color", "red");

  } else {
//    cell.css("background-color", "white");

  }

}

  updateEvent()
  {
    /*
    console.log(this.events);
    this.selected['title'] = this.collectName;
    this.events.push(this.selected);
    */
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
  //  console.log(event);
    //this.dialogVisible = true;

    //trigger detection manually as somehow only moving the mouse quickly after click triggers the automatic detection
    this.cd.detectChanges();
  }

  handleEventClick(e) {
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
   // this.event.allDay = e.calEvent.allDay;
    //this.deleteEvent();
    //this.dialogVisible = true;
  }

  saveEvent(title: string, collectId: string) {
      //update
    /*
      if(this.event && this.event.id) {
        let index: number = this.findEventIndexById(this.event.id);
        if(index >= 0) {
          this.events[index] = this.event;
        }
      }*/
      //new
      //else {

        let event = new MyEvent();
        event.id = this.idGen++;
        event.title = title;
        event.collectId = collectId;
        event.start = this.eventDates.start;
        event.end = this.eventDates.end;
        this.events.push(event);
      //  this.event = new MyEvent();
      //}

      //this.elementRef.nativeElement.querySelector('.fc-content').addEventListener('click', function(e){console.log(e); });
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
      if(id == this.events[i].id) {
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

  getAllocations(){
    //OrgAdminView/Allocation?dtBegin=2017-05-01T00:00:00&dtEnd=2017-03-02T00:00:00.000
    return this.apiService.getData('OrgAdminView/Allocation')
      .then(resp => {
          this.events.length = 0;
          console.log(resp);
          for(let i = 0; i < resp.length; i++) {
            let event = new MyEvent();
            event.id = resp[i]['Id'];
            console.log(resp[i]);
            event.title = resp[i]['Name'];
            event.start = moment().format(resp[i]['dtBegin']);
            event.end = moment().format(resp[i]['dtEnd']);
            event.collectId = resp[i]['CollectId'];
            //console.log(event);
            this.events.push(event);
          }

        });
  }

  saveAllocation(title: string, collectId: string){
    console.log(this.event);
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


      })
      .catch(err => {console.log(err); console.log("err")});

    this.event = new MyEvent();
  }

  deleteAllocation(){
    this.apiService.deleteData('OrgAdminView/Allocation?Id=' + this.event.id)
      .then(resp => { console.log(resp)})
      .catch(err => console.log(err));
  }

  eventRender(event: any, element: any, view: any){
    console.log(event);
    element[0].innerText = event.title + " (" + event.collectId  + ")";
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
