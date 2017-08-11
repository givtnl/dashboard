import {Component, OnInit, ViewEncapsulation, ElementRef} from '@angular/core';
import { ApiClientService } from "app/services/api-client.service";
import { TranslateService } from "ng2-translate";
import { ViewChild,ChangeDetectorRef } from '@angular/core';
import 'fullcalendar';
import 'fullcalendar/dist/locale/nl';
import {AllocationTimeSpanItem, Transaction} from "../models/allocationTimeSpanItem";
import {element} from "protractor";
declare var moment: any;
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
  collectOneCheck = false;
  collectTwoCheck = false;
  collectThreeCheck = false;
  collectOneAmount : string;
  collectTwoAmount : string;
  collectThreeAmount : string;
  isDialogOpen: boolean;
  showForm = true;
  showDelete = false;
  event: MyEvent = new MyEvent();
  idGen = 100;
  errorShown: boolean;
  errorMessage: string;
  currentViewStart: any;
  currentViewEnd: any;
  openGivts : any;
  openGivtsBucket : Array<AllocationTimeSpanItem> = new Array<AllocationTimeSpanItem>();
  isSafari: boolean;
  collectionTranslation: string;
  notYetAllocated: string;
  collectOneTyping: boolean = false;
  collectTwoTyping: boolean = false;
  collectThreeTyping: boolean = false;
  usedTags: string[];
  filteredUsedTags: string[];


  startTime: Date;
  endTime: Date;

  @ViewChild('calendar') calendar: ElementRef;
  public constructor(private ts: TranslateService, private cd: ChangeDetectorRef, private apiService: ApiClientService) {
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.ts.get('Collection').subscribe((res: string) => {
        this.collectionTranslation = res;
      });
    this.ts.get('NotYetAllocated').subscribe((res: string) => {
      this.notYetAllocated = res;
    });
  }

  ngOnInit(): void {
    this.events = [];
    this.headerConfig = {
      left: 'prev,next today',
      center: 'title',
      right: 'agendaWeek,agendaDay'
    };
    this.options['viewRender'] = function(view, element) {
      this.isMonthView = view["type"] === "month";
      this.currentViewStart = view.start['_d'].toISOString();
      this.currentViewEnd = view.end['_d'].toISOString();
      this.events.length = 0;
      this.getAllocations();
      this.checkAllocations();
    }.bind(this);
    this.options['eventAfterRender'] = function(event, element, view){
     this.eventAfterRender(event, element, view);
    }.bind(this);
    this.options['eventRender'] = function(event, element, view){
      this.eventRender(this, event, element, view);
    }.bind(this);
    this.options['slotDuration'] = '00:30:00';
    this.options['timezone'] = 'local';
    this.options['defaultView'] = 'agendaWeek';
    this.options['locale'] = this.ts.currentLang;
    this.options['eventDurationEditable'] = false;
    this.options['eventStartEditable'] = false;
    this.options['fixedWeekCount'] = false;
    this.options['unselectAuto'] = false;
    this.options['selectable'] = true;
    this.options['select'] = function(start, end, jsEvent, view, resource) {
      this.addAllocation(start["_d"], end["_d"]);
    }.bind(this);

    this.apiService.getData('OrgAdmin/getTags')
        .then(data => {
          this.usedTags = data;
        });
  }

  collectOneChanging(event){
    this.collectThreeTyping = false;
    this.collectTwoTyping = false;
    this.collectOneTyping = event != "";
    this.filterTags(event);
  }

  collectTwoChanging(event){
    this.collectOneTyping = false;
    this.collectThreeTyping = false;
    this.collectTwoTyping = event != "";
    this.filterTags(event);
  }

  collectThreeChanging(event){
    this.collectOneTyping = false;
    this.collectTwoTyping = false;
    this.collectThreeTyping = event != "";
    this.filterTags(event);
  }

  filterTags(typed){
    this.filteredUsedTags = [];
    for(let i = 0; i < this.usedTags.length; i++){
      let styledTerm = "<span class='autocomplete'>" + typed + "</span>";
      if(this.usedTags[i].includes(typed) && this.filteredUsedTags.length < 10)
        this.filteredUsedTags.push(this.usedTags[i].replace(typed, styledTerm));
    }
  }

  focusout(collect){
    var that = this;
    switch(collect){
      case 1:
        setTimeout(()=> {that.collectOneTyping = false}, 200);
        break;
      case 2:
        setTimeout(()=> {that.collectTwoTyping = false}, 200);
        break;
      case 3://
        setTimeout(()=> {that.collectThreeTyping = false}, 200);
        break;
    }
  }

  setCollectNameOne(item){
    this.collectName = item.replace("<span class='autocomplete'>","").replace("</span>","");
    this.collectOneTyping = false;
  }
  setCollectNameTwo(item){
    this.collectName2 = item.replace("<span class='autocomplete'>","").replace("</span>","");
    this.collectTwoTyping = false;
  }
  setCollectNameThree(item){
    this.collectName3 = item.replace("<span class='autocomplete'>","").replace("</span>","");
    this.collectThreeTyping = false;
  }

  addAllocation(start, end)
  {
    if(this.openGivts.length === 0)
      return;
    let check = false;
    this.collectOneAmount = "";
    this.collectTwoAmount = "";
    this.collectThreeAmount = "";
    var c1am = 0;
    var c2am = 0;
    var c3am = 0;
    for(let i = 0; i < this.openGivts.length; i++){
      let dtConfirmed = new Date(this.openGivts[i]["Timestamp"]);
      let dtStart = new Date(start);
      let dtEnd = new Date(end);
      if(dtConfirmed > dtStart && dtConfirmed < dtEnd)
      {
        check = true;
        switch (this.openGivts[i].CollectId){
          case "1":
            console.log(this.openGivts[i]);
            c1am = c1am + this.openGivts[i].Amount;
            this.collectOneCheck = true;
            break;
          case "2":
            this.collectTwoCheck = true;
            c2am += this.openGivts[i].Amount;
            break;
          case "3":
            c3am += this.openGivts[i].Amount;
            this.collectThreeCheck = true;
            break;
          default:
            break;
        }
      }
    }
    if(check)
    {
      console.log(c1am);
      this.collectOneAmount = this.displayValue(c1am);
      this.collectTwoAmount = this.displayValue(c2am);
      this.collectThreeAmount = this.displayValue(c3am);
      this.startTime = new Date(start);
      this.endTime = new Date(end);
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
            if(this.openGivtsBucket[i].dtStart.getTime() === startTime.getTime())
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
          if(this.openGivtsBucket.length === 0)
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

          //total amount == amount

          let event = new MyEvent();
          event.id = count;
          event.title = (Math.round(amount * 100) / 100).toString();
          event.start = this.openGivtsBucket[count].dtStart;
          event.end = this.openGivtsBucket[count].dtEnd;
          event.collectId = "1";
          event.className = "money";
          event.allocated = false;
          event.transactions = buckets;
          this.events.push(event);
        }
      });
  }

  updateEvent() {
    if (this.collectName === '' && this.collectName2 === '' && this.collectName3 === '') return;
    var promiseArr = [];
    Promise.all([this.saveAllocation(this.collectName, "1"),this.saveAllocation(this.collectName2, "2"), this.saveAllocation(this.collectName3, "3")]).then(function() {
      this.resetAll();
    }.bind(this));
    this.resetAll(false);
  }

  resetAll(reload: boolean = true){
    this.showForm = false;
    this.showDelete = false;
    this.isDialogOpen = false;
    this.collectOneCheck = false;
    this.collectTwoCheck = false;
    this.collectThreeCheck = false;
    this.collectName = "";
    this.collectName2 = "";
    this.collectName3 = "";
    this.event = new MyEvent();
    this.startTime = new Date();
    this.endTime = new Date();
    if(reload){
      this.events.length = 0;
      this.getAllocations();
      this.checkAllocations();
    }
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
      this.addAllocation(dStart, dEnd);
    } else {
      this.isDialogOpen = true;
      this.showForm = false;
      this.showDelete = true;
    }
  }

  deleteEvent() {
    let eventId = this.event.id;
    let index: number = this.findEventIndexById(eventId);
    if (index >= 0) {
      this.events.splice(index, 1);
    }
    this.apiService.deleteData('OrgAdminView/Allocation?Id=' + eventId)
      .then(resp => {
        this.resetAll();
      })
      .catch(err => {
        console.log(err);
      });
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
        if(!this.collectTwoCheck && !this.collectThreeCheck)
          return;
        this.collectOneCheck = false;
        this.collectName = "";
        break;
      case 2:
        if(!this.collectOneCheck && !this.collectThreeCheck)
          return;
        this.collectTwoCheck = false;
        this.collectName2 = "";
        break;
      case 3:
        if(!this.collectOneCheck && !this.collectTwoCheck)
          return;
        this.collectThreeCheck = false;
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
        for(let i = 0; i < resp.length; i++) {
          let event = new MyEvent();
          event.id = resp[i]['Id'];
          event.title = resp[i]['Name'];
          event.start = new Date(resp[i]['dtBegin'] + " UTC");
          event.end = new Date(resp[i]['dtEnd'] + " UTC");
          event.collectId = resp[i]['CollectId'];
          event.className = "allocation";
          event.allocated = true;
          event.amount = this.displayValue("0");
          this.events.push(event);
          let params = "dtBegin=" + moment.utc(event.start).format() + "&dtEnd=" + moment.utc(event.end).format() + "&collectId=" + event.collectId;
          this.apiService.getData("OrgAdmin/AllocationGivts?"+params)
              .then(resp => {
                let index = this.findEventIndexById(event.id);
                this.events[index].amount = resp;
              });
        }
      })
      .catch(err => console.log(err));
  }

  saveAllocation(title: string, collectId: string){
    return new Promise((resolve, reject) => {
      if(title === "") {
        resolve();
        return;
      }
      console.log(collectId);
      let event = new MyEvent();
      event.id = this.idGen++;
      event.title = title;
      event.collectId = collectId;
      event.start = this.startTime;
      event.end = this.endTime;

      let body = new Object();
      body["name"] = title;
      body["dtBegin"] = this.startTime;
      body["dtEnd"] = this.endTime;
      body["CollectId"] = collectId;
      this.apiService.postData("OrgAdminView/Allocation", body)
        .then(resp => {
          if(resp.status === 409){
            this.toggleError(true, "Je zit met een overlapping");
          }
          if(this.usedTags.indexOf(title) < 0)
            this.usedTags.push(title);
          resolve();
        })
        .catch(err => {
          console.log(err);
        });

    })

  }

  eventAfterRender(event: any, element: any, view: any){
    if(element[0].style.left === "33.3333%"){
      element[0].style.left = "31%";
    } else if(element[0].style.left === "66.6667%") {
      element[0].style.left = "62%";
    } else if(element[0].style.left === "50%") {
      element[0].style.left = "31%";
    }
  }
  eventRender(that: any,event: any, element: any, view: any){
    element[0].innerText = event.title;
    element[0].addEventListener("mouseover", function(ev) {

      let fcEvent = that.events[that.findEventIndexById(event.id)];
      let div = document.createElement("div");

      if(fcEvent.allocated){
        let temp = parseFloat(fcEvent.amount);
        div.innerHTML = "<span class='fat-font'>" + that.displayValue(fcEvent.amount) + "</span> <span>" + that.collectionTranslation + " " + fcEvent.collectId  + "</span><br/>"
                        + "<span class='fat-font'>" + fcEvent.title + "</span>";
        div.className = "balloon balloon_alter";
      } else {
        div.innerHTML = that.notYetAllocated + "<br/>";
        if(fcEvent.transactions.length > 0){
          let collect1 = 0;
          let collect2 = 0;
          let collect3 = 0;
          for(let i = 0; i < fcEvent.transactions.length; i++){
            let transaction = fcEvent.transactions[i];
            if(transaction.CollectId === "1"){
              collect1 += transaction.Amount;
            } else if(transaction.CollectId === "2"){
              collect2 += transaction.Amount;
            } else if(transaction.CollectId === "3"){
              collect3 += transaction.Amount;
            }
          }
          if(collect1 > 0){
            div.innerHTML += "<span class='fat-font'>" + that.displayValue(collect1) + "</span> " + that.collectionTranslation + " 1<br/>";
          }
          if(collect2 > 0)
            div.innerHTML += "<span class='fat-font'>" + that.displayValue(collect2) + "</span> " + that.collectionTranslation + " 2<br/>";
          if(collect3 > 0)
            div.innerHTML += "<span class='fat-font'>" + that.displayValue(collect3) + "</span> " + that.collectionTranslation + " 3<br/>";
        }
        div.className = "balloon";
      }

      let offsets = ev.srcElement.getBoundingClientRect();
      let top = offsets.top;
      let left = offsets.left;
      //div.style.top = top - div.offsetHeight +"px";
      div.style.left = left +"px";
      document.getElementsByClassName("section-page")[0].appendChild(div);
      div.style.top = top - div.offsetHeight - 17 +"px";

    });
    element[0].addEventListener("mouseleave", function(){
        let b = document.getElementsByClassName("balloon");
        while(b.length > 0){
          b[0].remove();
        }
      }, true);

      element[0].innerHTML = "";

  }

  displayValue(x)
  {
    if(x === undefined) x = 0;
    let euro =  "€";
    if(!navigator.language.includes('en'))
      euro += " ";
    return euro + (this.isSafari ? parseFloat(x).toFixed(2) : (x).toLocaleString(
      navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2})
      );
  }


}

export class MyEvent {
  id: number;
  title: string;
  start: any;
  end: any;
  collectId: string;
  className: string;
  allocated = true;
  transactions: any;
  amount: any;
}
