import {Component, OnInit, ViewEncapsulation, Renderer2, ElementRef} from '@angular/core';
import { ApiClientService } from "app/services/api-client.service";
import { TranslateService } from "ng2-translate";
import { ViewChild,ChangeDetectorRef } from '@angular/core';

import 'fullcalendar';
import 'fullcalendar/dist/locale/nl';
import {AllocationTimeSpanItem, Transaction} from "../models/allocationTimeSpanItem";

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
  collectName = '';
  collectName2 = '';
  collectName3 = '';
  collectOne: boolean = false;
  collectTwo: boolean = false;
  collectThree: boolean = false;
  collectOneCheck: boolean = false;
  collectTwoCheck: boolean = false;
  collectThreeCheck: boolean = false;
  isDialogOpen: boolean;
  isMultipleCollects: boolean = false;
  showForm = true;
  showDelete = false;
  event: MyEvent = new MyEvent();
  eventDates: MyEvent = new MyEvent();
  idGen: number = 100;
  errorShown: boolean;
  errorMessage: string;
  currentViewStart: any;
  currentViewEnd: any;
  openGivts : any;
  openGivtsBucket : Array<AllocationTimeSpanItem> = new Array<AllocationTimeSpanItem>();

  @ViewChild('calendar') calendar: ElementRef;
  public constructor(private ts: TranslateService, private cd: ChangeDetectorRef, private apiService: ApiClientService) {

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
    this.options['slotDuration'] = '00:30:00';
    this.options['timezone'] = 'local';
    this.options['defaultView'] = 'agendaWeek';
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
      this.addAllocation(start["_d"], end["_d"]);
    }.bind(this);
  }

  addAllocation(start, end)
  {
    if(this.openGivts.length == 0)
      return;
    this.eventDates.start = start;
    this.eventDates.end = end;
    let check = false;
    for(let i = 0; i < this.openGivts.length; i++){
      let dtConfirmed = new Date(this.openGivts[i]["Timestamp"]);
      var dtStart = new Date(start);
      var dtEnd = new Date(end);
      if(dtConfirmed > dtStart && dtConfirmed < dtEnd)
      {
        check = true;
        switch (this.openGivts[i].CollectId){
          case "1":
            this.collectOneCheck = true;
            this.collectOne = true;
            break;
          case "2":
            this.collectTwoCheck = true;
            this.collectTwo = true;
            break;
          case "3":
            this.collectThreeCheck = true;
            this.collectThree = true;
            break;
          default:
            break;
        }
      }
    }
    if(check)
    {
      this.isDialogOpen = true;
      this.showForm = true;
    }
  }

  checkAllocations(){
    let apiUrl = 'OrgAdminView/AllocationCheck';
    if(this.currentViewStart !== null && this.currentViewEnd !== null){
      apiUrl += "?dtBegin=" + this.currentViewStart + "&dtEnd=" + this.currentViewEnd;
    }
    this.apiService.getData(apiUrl)
      .then(resp => {
        for(let i = 0; i < resp.length; i++)
        {
          let d = new Date(resp[i]["Timestamp"] + " UTC");
          resp[i]["Timestamp"] = d;
        }
        this.openGivts = resp;
        this.openGivtsBucket = [];

        for(let x = 0; x < this.openGivts.length; x++){
          let startTime = new Date(resp[x]['Timestamp']);
          let endTime = new Date(resp[x]['Timestamp']);
          if(startTime.getMinutes() < 30)
          {
            startTime.setMinutes(0,0,0);
            endTime.setMinutes(30,0,0);
          }else{
            startTime.setMinutes(30,0,0);
            endTime.setHours(endTime.getHours() + 1,0,0,0);
          }

          let check = false;
          for(let i = 0; i < this.openGivtsBucket.length; i++)
          {
            if(this.openGivtsBucket[i].dtStart.getTime() == startTime.getTime())
            {
              this.openGivtsBucket[i].transactions.push(this.openGivts[x]);
              check = false;
              break;
            }
            check = true;
          }
          if(check){
            let item = new AllocationTimeSpanItem();
            item.dtEnd = endTime;
            item.dtStart = startTime;
            item.transactions = new Array<Transaction>();
            item.transactions.push(this.openGivts[x]);
            this.openGivtsBucket.push(item);
          }
          if(this.openGivtsBucket.length == 0)
          {
            let item = new AllocationTimeSpanItem();
            item.dtEnd = endTime;
            item.dtStart = startTime;
            item.transactions = new Array<Transaction>();
            item.transactions.push(this.openGivts[x]);
            this.openGivtsBucket.push(item);
          }
        }
        for(let count = 0; count < this.openGivtsBucket.length; count++)
        {
          let buckets = <any>this.openGivtsBucket[count]['transactions'];
          let amount = 0;
          for(let tr = 0; tr < buckets.length; tr++)
          {
            amount += buckets[tr].Amount;
          }
          let event = new MyEvent();
          event.id = count;
          event.title = "€ " + Math.round(amount * 100) / 100;
          event.start = this.openGivtsBucket[count].dtStart;
          event.end = this.openGivtsBucket[count].dtEnd;
          event.collectId = "1";
          event.type = "money";
          event.className = "money";
          event.backgroundColor = "#F17057";
          event.allocated = false;
          this.events.push(event);
        }
      });
  }

  dayRender(e:any, cell:any) {
    let today = new Date();
    let end = new Date();
    let day  = today.getDate();
    end.setDate(day + 7);
  }

  updateEvent()
  {
    if (this.collectName === '' && this.collectName2 === '' && this.collectName3 === '') return;
    if(this.collectName)
      this.saveEvent(this.collectName, "1");
    if(this.collectName2)
      this.saveEvent(this.collectName2, "2");
    if(this.collectName3)
      this.saveEvent(this.collectName3, "3");

    this.showForm = false;
    this.isDialogOpen = false;
    this.clearAll();
  }

  clearAll(){
    this.isMultipleCollects = false;
    this.showForm = false;
    this.showDelete = false;
    this.isDialogOpen = false;
    this.collectOne = false;
    this.collectTwo = false;
    this.collectThree = false;
    this.collectOneCheck = false;
    this.collectTwoCheck = false;
    this.collectThreeCheck = false;
    this.collectName = "";
    this.collectName2 = "";
    this.collectName3 = "";
    this.event = new MyEvent();
  }

  handleDayClick(event) {
    this.event = new MyEvent();
    this.event.start = event.date.format();

    //trigger detection manually as somehow only moving the mouse quickly after click triggers the automatic detection
    this.cd.detectChanges();
  }

  handleEventClick(e) {
    let start = e.calEvent.start;
    let end = e.calEvent.end;
    if(e.view.name === 'month') {
      start.stripTime();
      end.stripTime();
    }

    if(end) {
      this.event.end = end.format();
    }

    this.event.id = e.calEvent.id;
    this.event.start = start.format();
    if(!e.calEvent.allocated){
      let dStart = new Date(this.event.start);
      let dEnd = new Date(this.event.end);
      this.addAllocation(dStart.toLocaleString(), dEnd.toLocaleString());
      return;
    }
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
    this.clearAll();
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

  deleteCollect(id){
    switch (id){
      case 1:
        this.collectOne = false;
        this.collectName = "";
        break;
      case 2:
        this.collectTwo = false;
        this.collectName2 = "";
        break;
      case 3:
        this.collectThree = false;
        this.collectName3 = "";
        break;
      default:
        break;
    }
  }

  getAllocations(dtStart:any = null,dtEnd: any = null){
    let apiUrl = 'OrgAdminView/Allocation';
     if(this.currentViewStart !== null && this.currentViewEnd !== null) {
       apiUrl += "?dtBegin=" + this.currentViewStart + "&dtEnd=" + this.currentViewEnd;
     }
    return this.apiService.getData(apiUrl)
      .then(resp => {
          this.events.length = 0;
          for(let i = 0; i < resp.length; i++) {
            let event = new MyEvent();
            event.id = resp[i]['Id'];
            event.title = "(" + resp[i]['CollectId'] + ") " + resp[i]['Name'];
            event.start = new Date(resp[i]['dtBegin'] + " UTC");
            event.end = new Date(resp[i]['dtEnd'] + " UTC");
            event.collectId = resp[i]['CollectId'];
            event.backgroundColor = "#1CA96C";
            event.className = "allocation";
            this.events.push(event);
          }
        })
      .catch(err => console.log(err));
  }

  saveAllocation(title: string, collectId: string){
    let body = new Object();
    body["name"] = title;
    body["dtBegin"] = this.eventDates.start;
    body["dtEnd"] = this.eventDates.end;
    body["CollectId"] = collectId;
    this.apiService.postData("OrgAdminView/Allocation", body)
      .then(resp => {
        if(resp.status === 409){
          this.toggleError(true, "Je zit met een overlapping");
          this.getAllocations();
          this.checkAllocations();
        }
        this.getAllocations();
        this.checkAllocations();
      })
      .catch(err => {console.log(err)});

    this.event = new MyEvent();
  }

  deleteAllocation(){
    this.apiService.deleteData('OrgAdminView/Allocation?Id=' + this.event.id)
      .then(resp => { this.getAllocations(); this.checkAllocations(); })
      .catch(err => console.log(err));
  }

  eventRender(event: any, element: any, view: any){
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
  type: string;
  className: string;
  allocated: boolean = true;
}
