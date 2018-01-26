import {Component, OnInit, ViewEncapsulation, ElementRef, AfterViewInit} from '@angular/core';
import { ApiClientService } from "app/services/api-client.service";
import { TranslateService } from "ng2-translate";
import { ViewChild,ChangeDetectorRef } from '@angular/core';
import 'fullcalendar';
import 'fullcalendar/dist/locale/nl';
import {AllocationTimeSpanItem, Transaction} from "../models/allocationTimeSpanItem";
import {element} from "protractor";
import {UserService} from "../services/user.service";
import {Button} from "primeng/primeng";
import * as moment from "moment";
import _date = moment.unitOfTime._date;
import {forEach} from "@angular/router/src/utils/collection";
//declare var moment: any;
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
  usersTransalation: string;
  notYetAllocated: string;
  allCollectTyping: boolean = false;
  usedTags: string[];
  filteredUsedTags: string[];
  allocateWeekName: string = "";
  numberOfFilteredEvents = 0;
  SelectedTab = SelectedTab;
  ButtonState = ButtonState;
  currentTab: SelectedTab = SelectedTab.Collects;
  allocatedBuckets: any;
  that = this;

  filteredEvents() {
    if(this.events == undefined)
    {
      this.numberOfFilteredEvents = 0;
      return [];
    }

    let filtered = this.events.filter(
      events => events.allocated === false
    );
    this.numberOfFilteredEvents = filtered.length;
    return filtered
  }


  startTime: Date;
  endTime: Date;

  @ViewChild('calendar') calendar: ElementRef;
  public constructor(private ts: TranslateService, private cd: ChangeDetectorRef, private apiService: ApiClientService, private userService: UserService) {
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.ts.get('Collection').subscribe((res: string) => {
        this.collectionTranslation = res;
      });
    this.ts.get('NotYetAllocated').subscribe((res: string) => {
      this.notYetAllocated = res;
    });
    this.ts.get('Users').subscribe((res: string) => {
      this.usersTransalation = res;
    });

    document.onkeydown = function(evt){
      evt = evt || window.event;
      if(this.isDialogOpen && evt.keyCode == 27){
        this.resetAll(false);
      }
    }.bind(this);
    this.userService.collectGroupChanged.subscribe(() => {
      this.ngOnInit();
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
    this.options['eventAfterAllRender'] = function(view) {
      this.filteredEvents();
    }.bind(this);
    this.options["eventClick"] = function(event, jsEvent, view) {
      this.event = event;

      let start = event.start;
      let end = event.end;
      if(view.name === 'month') {
        start.stripTime();
        end.stripTime();
      }

      if(end) {
        this.event.end = end.format();
      }

      this.event.id = event.id;
      this.event.start = start.format();
      if(!event.allocated){
        let dStart = new Date(this.event.start);
        let dEnd = new Date(this.event.end);
        this.addAllocation(dStart, dEnd);
      } else {
        this.isDialogOpen = true;
      }
      this.isDialogOpen = true;
    }.bind(this);
    this.options["eventMouseover"] = function(event, jsEvent, view) {
        let fcEvent = event;

        let div = document.createElement("div");
        this.firstCollection = new AssignedCollection();
        this.secondCollection = new AssignedCollection();
        this.thirdCollection = new AssignedCollection();

        if(fcEvent.allocated){
          if(fcEvent.transactions.length > 0) {
            for(let i = 0; i < fcEvent.transactions.length; i++) {
              let tr = fcEvent.transactions[i];
              if(tr.CollectId  === "1") {
                this.fillCollectBy(this.firstCollection, tr.Status,tr.Amount);
                this.firstCollection.name = fcEvent.transactions[i].AllocationName;
                this.firstCollection.allocated = true;
              } else if(tr.CollectId === "2") {
                this.fillCollectBy(this.secondCollection, tr.Status,tr.Amount);
                this.secondCollection.name = fcEvent.transactions[i].AllocationName;
                this.secondCollection.allocated = true;


              } else if(tr.CollectId === "3") {
                this.fillCollectBy(this.thirdCollection, tr.Status,tr.Amount);
                this.thirdCollection.name = fcEvent.transactions[i].AllocationName;
                this.thirdCollection.allocated = true;



              }
            }
          }
          if(!fcEvent.amount){
            this.ts.get('Loading').subscribe((res) => {
              div.innerHTML = "<span class='fat-font'>" + res + "...</span>";
            });
          } else {
            div.innerHTML = "<span><img src='images/user.png' height='15px' width='15px' style='padding-top: 2px'> " + fcEvent.noTransactions + "</span>"
              + "<span style='margin-left:15px' class='fat-font'>" + this.displayValue(fcEvent.amount) + "</span> <span>" + this.collectionTranslation + " " + fcEvent.collectId + "</span><br/>"
              + "<span class='fat-font'>" + fcEvent.title + "</span>";
          }
          div.className = "balloon balloon_alter";
        } else {
          div.innerHTML = this.notYetAllocated + "<br/>";
          if(fcEvent.transactions.length > 0){
            this.firstCollection = new AssignedCollection();

            for(let i = 0; i < fcEvent.transactions.length; i++){
              let transaction = fcEvent.transactions[i];
              if(transaction.CollectId === "1"){
                //////
                this.fillCollectBy(this.firstCollection, transaction.Status, transaction.Amount);
              } else if(transaction.CollectId === "2"){
                this.fillCollectBy(this.secondCollection, transaction.Status, transaction.Amount);

              } else if(transaction.CollectId === "3"){
                this.fillCollectBy(this.thirdCollection, transaction.Status, transaction.Amount);
              }
            }

          }
          div.innerHTML = "<span>Click the item to view more information</span>";
          div.className = "balloon";
        }

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
    this.options['scrollTime'] = '08:00:00';
    this.options['select'] = function(start, end, jsEvent, view, resource) {
      this.addAllocation(start["_d"], end["_d"]);
    }.bind(this);

    this.apiService.getData('Allocations/AllocationTags')
        .then(data => {
          this.usedTags = data;
        });
  }

  filterTags(typed){
    this.filteredUsedTags = [];
    let regex = new RegExp(typed, "i");
    this.usedTags.forEach(function(value) {
      if(value.search(regex) != -1 && this.filteredUsedTags.length < 10 && value.trim() != "") {
        let hlight = "<span class='autocomplete'>" + value.match(regex)[0] + "</span>";
        this.filteredUsedTags.push(value.replace(regex, hlight));
      }
    }, this);
  }

  setCollectNameOf(item, aCollection: AssignedCollection) {
    aCollection.name = item.replace("<span class='autocomplete'>","").replace("</span>","");
    aCollection.isTyping = false;
  }

  addAllocation(start, end)
  {
    if(this.openGivts.length === 0)
      return;
    let check = false;
    this.firstCollection = new AssignedCollection();
    this.secondCollection = new AssignedCollection();
    this.thirdCollection = new AssignedCollection();
    for(let i = 0; i < this.openGivts.length; i++){
      let dtConfirmed = new Date(this.openGivts[i]["dt_Confirmed"]);
      let dtStart = new Date(start);
      let dtEnd = new Date(end);
      if(dtConfirmed > dtStart && dtConfirmed < dtEnd)
      {


        check = true;
        switch (this.openGivts[i].CollectId){
          case "1":
            this.fillCollectBy(this.firstCollection, this.openGivts[i].Status, this.openGivts[i].Amount);
            break;
          case "2":
            this.fillCollectBy(this.secondCollection, this.openGivts[i].Status, this.openGivts[i].Amount);
            break;
          case "3":
            this.fillCollectBy(this.thirdCollection, this.openGivts[i].Status, this.openGivts[i].Amount);
            break;
          default:
            break;
        }
      }
    }
    if(check)
    {
      this.startTime = new Date(start);
      this.endTime = new Date(end);
      this.isDialogOpen = true;
      this.showForm = true;
    }
  }

  checkAllocations(){
    let apiUrl = 'Allocations/AllocationCheck';
    if(this.currentViewStart !== null && this.currentViewEnd !== null){
      apiUrl += "?dtBegin=" + this.currentViewStart + "&dtEnd=" + this.currentViewEnd;
    }

    this.apiService.getData(apiUrl)
      .then(resp => {
        for(let i = 0; i < resp.length; i++)
        {
          let d = new Date(resp[i]["dt_Confirmed"] + " UTC");
          resp[i]["dt_Confirmed"] = d;
        }

        this.openGivts = resp.filter((ts) => {
          return ts.AllocationName == null;
        });

        this.allocatedBuckets = resp.filter((ts) => {
          return ts.AllocationName != null;
        });

        this.openGivtsBucket = [];

        this.renderOpenGivts();
        this.renderAllocatedGivts();


      });
  }

  shouldHideCollect1Button = false;
  updateEvent(aCollection: AssignedCollection = null, collectId = null) {
    if (collectId != null && aCollection != null) {
      aCollection.state = ButtonState.isLoading;
      Promise.all([this.saveAllocation(aCollection.name, collectId)]).then(
        function () {
          aCollection.state = ButtonState.Saved;
          this.reloadEvents();
        }.bind(this)
      );
    }
  }

  renderAllocatedGivts() {
    let buckets: Bucket[] = [];
    for(let x = 0; x < this.allocatedBuckets.length; x++) {
      let startTime = new Date(this.allocatedBuckets[x]['dtBegin']);
      let endTime = new Date(this.allocatedBuckets[x]['dtEnd']);
      this.allocatedBuckets[x]['dtBegin'] = startTime;
      this.allocatedBuckets[x]['dtEnd'] = endTime;
      let filteredBuckets = buckets.filter((b) => b.startTime.getTime() == this.allocatedBuckets[x]['dtBegin'].getTime() && b.endTime.getTime() == this.allocatedBuckets[x]['dtEnd'].getTime());
      if(filteredBuckets.length == 0) {
        //transaction does not fit into bucket
        //create new bucket and add to array
        let newBucket = new Bucket();
        newBucket.startTime = startTime;
        newBucket.endTime = endTime;
        newBucket.allocationName = this.allocatedBuckets[x].AllocationName;
        newBucket.allocationId = this.allocatedBuckets[x].AllocationId;
        newBucket.transactions = [];
        buckets.push(newBucket)
      }

      let currentBucket = buckets.filter((b) => b.startTime.getTime() == this.allocatedBuckets[x]['dtBegin'].getTime() && b.endTime.getTime() == this.allocatedBuckets[x]['dtEnd'].getTime())[0];
      currentBucket.transactions.push(this.allocatedBuckets[x]);
    }

    for(let i = 0; i < buckets.length; i++) {
      let event = new MyEvent();
      event.id = buckets[i].allocationId;
      event.title = buckets[i].allocationName;
      event.start = buckets[i].startTime;
      event.end = buckets[i].endTime;
      event.className = "allocation";
      event.allocated = true;
      event.amount = null;
      event.transactions = buckets[i].transactions;
      this.events.push(event);
    }
  }

  renderOpenGivts() {
    for(let x = 0; x < this.openGivts.length; x++){
      let startTime = new Date(this.openGivts[x]['dt_Confirmed']);
      let endTime = new Date(this.openGivts[x]['dt_Confirmed']);
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
      event.collectId = "1"; //what
      event.className = "money";
      event.allocated = false;
      event.transactions = buckets;
      this.events.push(event);
    }
  }

  resetAll(reload: boolean = true){
    this.firstCollection = new AssignedCollection();
    this.secondCollection = new AssignedCollection();
    this.thirdCollection = new AssignedCollection();
    this.showForm = false;
    this.showDelete = false;
    this.isDialogOpen = false;
    this.event = new MyEvent();
    this.startTime = new Date();
    this.endTime = new Date();
    if(reload){
      this.reloadEvents()
    }
  }

  reloadEvents() {
    this.events.length = 0;
    this.getAllocations();
    this.checkAllocations();
  }

  handleDayClick(event) {
    this.event = new MyEvent();
    this.event.start = event.date.format();

    //trigger detection manually as somehow only moving the mouse quickly after click triggers the automatic detection
    this.cd.detectChanges();
  }

  handleEventClick(e) {
    console.log(e);
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
    }
  }

  deleteEvent() {
    let eventId = this.event.id;
    let index: number = this.findEventIndexById(eventId);
    let thisEvent = this.event;
    if (index >= 0) {
      this.events.splice(index, 1);
    }
    let promises = [];
    let allocationsIds = [];
    for(var i = 0; i < thisEvent.transactions.length; i++) {
      allocationsIds.push(thisEvent.transactions[i].AllocationId);
    }

    allocationsIds = allocationsIds.filter((item, i, ar) => {
      return ar.indexOf(item) === i;
    });

    for(var id of allocationsIds) {
      promises.push(this.apiService.deleteData('Allocations/Allocation?Id=' + id));
    }

    Promise.all(promises).then(() => {
      this.resetAll();
    }).catch((err) => console.log(err));

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
    return;
    let apiUrl = 'Allocations/Allocation';
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
          event.amount = null;
          event.transactions = [];
          this.events.push(event);
          let params = "dtBegin=" + moment.utc(event.start).format() + "&dtEnd=" + moment.utc(event.end).format() + "&collectId=" + event.collectId;
          this.apiService.getData("Allocations/AllocationGivts?"+params)
              .then(resp => {
                let index = this.findEventIndexById(event.id);
                this.events[index].noTransactions = resp.NoTransactions;
                this.events[index].amount = resp.Amount;
              });
        }
      })
      .catch(err => console.log(err));
  }

  saveAllocation(title: string, collectId: string, startTime: Date = null, endTime: Date = null){
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

      event.start = startTime == null ? this.startTime : startTime;
      event.end = endTime == null ? this.endTime : endTime;

      let body = new Object();
      body["name"] = title;
      body["dtBegin"] = startTime == null ? this.startTime : startTime;
      body["dtEnd"] = endTime == null ? this.endTime : endTime;
      body["CollectId"] = collectId;
      this.apiService.postData("Allocations/Allocation", body)
        .then(resp => {
          if(resp.status === 409){
            this.toggleError(true, "Je zit met een overlapping");
          }
          if (!this.usedTags.some(function(element) {
            if (element.toLowerCase() == title.toLowerCase())
              return true;
          })) {
            this.usedTags.push(title);
          }
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
  firstCollection = new AssignedCollection();
  secondCollection = new AssignedCollection();
  thirdCollection = new AssignedCollection();

  fillCollectBy(collection, statusId, amount) {
    switch (statusId) {
      case 1:
      case 2:
        collection.toProcessTotal += amount;
        break;
      case 3:
        collection.processedTotal += amount;
        break;
      case 4:
        collection.refusedBank += amount;
        break;
      case 5: //cancelbyuser
        collection.cancelByGiver += amount;
        break;
      default:
        break;
    }
    collection.amountOfGivts++;
  }

  eventRender(that: any,event: any, element: any, view: any){
    element[0].innerText = event.title;

    element[0].addEventListener("mouseover", function(ev) {
      let div = document.createElement("div");
      div.innerHTML = "<span>Click the item to view more information</span>";
      div.className = "balloon";
      let offsets = ev.srcElement.getBoundingClientRect();
      let top = offsets.top;
      let left = offsets.left;
      //div.style.top = top - div.offsetHeight +"px";
      div.style.left = left +"px";
      document.getElementsByClassName("section-page")[0].appendChild(div);
      div.style.top = top - div.offsetHeight - 17 +"px";
    }.bind(this));
    element[0].addEventListener("mouseleave", function(){
        let b = document.getElementsByClassName("balloon");
        while(b.length > 0){
          b[0].remove();
        }
      }, true);

      element[0].innerHTML = "";
  }

  onFocusOutOf(aCollection: AssignedCollection) {
    setTimeout(() => {
      aCollection.isTyping = false;
    }, 200);
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

  setWeekName(item) {
    this.allocateWeekName = item.replace("<span class='autocomplete'>","").replace("</span>","");
  }

  allocateWeek(){
    for(let i = 0; i < this.filteredEvents().length; i++) {
      let obj = this.filteredEvents()[i];
      let coll1 = false, coll2 = false, coll3 = false;
      for(let i = 0; i < obj.transactions.length; i++){
        switch (obj.transactions[i].CollectId){
          case "1":
            coll1 = true;
            break;
          case "2":
            coll2 = true;
            break;
          case "3":
            coll3 = true;
            break;
          default:
            console.log("unknown coll");
            break;
        }
      }
      if(coll1){
        this.saveAllocation(this.allocateWeekName, "1", obj.start, obj.end).then(function() {
        })
      }
      if(coll2){
        this.saveAllocation(this.allocateWeekName, "2", obj.start, obj.end).then(function() {
        })
      }
      if(coll3){
        this.saveAllocation(this.allocateWeekName, "3", obj.start, obj.end).then(function() {
        })
      }
    }
    setTimeout(()=>{
      this.allocateWeekName = "";
      this.resetAll();
      this.filterTags("");
    },250)
  }

  focusAllCollectsTyping(focus){
    if(!focus){
      let that = this;
      setTimeout(()=> {
        that.allCollectTyping = focus;
      }, 150);
    }else{
      this.allCollectTyping = focus;
    }
  }

  allCollectNameChanging(event){
    this.filterTags(event);
  }

}

export enum SelectedTab {
  Collects,
  Fixed
}

export enum ButtonState {
  Enabled,
  isLoading,
  Saved,
  Disabled
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

export class Bucket {
  startTime: Date;
  endTime: Date;
  allocationName: string;
  transactions: any;
  allocationId: number;
  collectId: string;
}

export class AssignedCollection {
  toProcessTotal: number;
  processedTotal: number;
  refusedBank: number;
  cancelByGiver: number;
  amountOfGivts : number;
  name: string;
  isTyping: boolean;
  state: ButtonState;
  allocated: boolean;

  constructor(toProcessTotal = 0, processedTotal = 0, refusedByBank = 0, cancelByGiver = 0, amountOfGivts = 0, name = "", isTyping = false, state = ButtonState.Enabled, allocated = false) {
    this.toProcessTotal = toProcessTotal;
    this.processedTotal = processedTotal;
    this.refusedBank = refusedByBank;
    this.cancelByGiver = cancelByGiver;
    this.amountOfGivts = amountOfGivts;
    this.name = name;
    this.isTyping = false;
    this.state = state;
    this.allocated = allocated;
  }
}
