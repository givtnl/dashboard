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
  collectName: string = '';
  isDialogOpen: boolean;
  selected: Object = new Object();
  isMultipleCollects: boolean = false;
  showForm = false;
  showDelete = false;
  event: MyEvent = new MyEvent();
  idGen: number = 100;
  schedule: any;
  public constructor(private cd: ChangeDetectorRef, private renderer: Renderer2, private elementRef:ElementRef) { }

  ngOnInit(): void {
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
  this.options['selectHelper'] = false;
    this.options['editable'] = true;
    this.options['unselectAuto'] = false;
    this.options['selectable'] = true;
    this.options['select'] = function(start, end, jsEvent, view, resource) {
      this.isDialogOpen = true;
      this.event.start = start;
      this.event.end = end;
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


      this.saveEvent();
    this.isDialogOpen = false;
    this.showForm = false;
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
    console.log(event);
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

  saveEvent() {
      //update
      if(this.event && this.event.id) {
        let index: number = this.findEventIndexById(this.event.id);
        if(index >= 0) {
          this.events[index] = this.event;
        }
      }
      //new
      else {
        this.event.id = this.idGen++;
        this.event.title = this.collectName;
        this.events.push(this.event);
        this.event = new MyEvent();
      }

      //this.elementRef.nativeElement.querySelector('.fc-content').addEventListener('click', function(e){console.log(e); });



  }

  deleteEvent() {
    let index: number = this.findEventIndexById(this.event.id);
    if(index >= 0) {
      this.events.splice(index, 1);
    }
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

}

export class MyEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
}
