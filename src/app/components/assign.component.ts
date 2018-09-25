import { Component, OnInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { ApiClientService } from "app/services/api-client.service";
import { TranslateService } from "ng2-translate";
import { ViewChild, ChangeDetectorRef } from '@angular/core';
import 'fullcalendar';
import 'fullcalendar/dist/locale/nl';
import { AllocationTimeSpanItem } from "../models/allocationTimeSpanItem";
import { UserService } from "../services/user.service";
import { DataService } from "../services/data.service";
import { AgendaView, moment } from "fullcalendar";
import { ISODatePipe } from "../pipes/iso.datepipe";
import { forEach } from "@angular/router/src/utils/collection";

@Component({
    selector: 'app-assign-collects',
    templateUrl: '../html/assign.component.html',
    styleUrls: ['../css/assign.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AssignComponent implements OnInit {
    events: MyEvent[];
    headerConfig: any;
    options: Object = {};
    isDialogOpen: boolean;

    event: MyEvent = new MyEvent();
    errorShown: boolean;
    errorMessage: string;
    currentViewStart: string; //UTC ISO date representation of current view start
    currentViewEnd: string; //UTC ISO date representation of current view end
    isSafari: boolean;
    allCollectTyping = false;
    usedTags: string[];
    filteredUsedTags: string[];
    allocateWeekName = "";
    SelectedTab = SelectedTab;
    currentTab: SelectedTab = SelectedTab.Collects;
    startTime: Date;
    endTime: Date;
    oldJsEvent: any;
    openedMobileEventId = -1;
    private firstDay = 0;
    agendaView: AgendaView;
    selectedCard: BucketCard;
    csvFile: File;
    csvFileName: string = ""
    addedAllocations: any[];
    selectedCSV: boolean = false;
    showCsvPopup: boolean = false;
    csvError: boolean = true
    isLoading = false;

    selectedAllocationDates = [];

    @ViewChild('calendar') calendar: ElementRef;
    // TODO: Rework
    // get allowButton(): boolean {
    //     if (this.firstCollection.amountOfGivts > 0 && this.firstCollection.allocated === false)
    //         return true;

    //     if (this.secondCollection.amountOfGivts > 0 && this.secondCollection.allocated === false)
    //         return true;

    //     return this.thirdCollection.amountOfGivts > 0 && this.thirdCollection.allocated === false;
    // }
    // get disableSaveButton(): boolean {
    //     for (let alloc of this.allocations) {
    //         if (alloc.amountOfGivts > 0 && alloc.name === "")
    //             return true;
    //     }
    //     return false;
    // }



    public constructor(public ts: TranslateService, private datePipe: ISODatePipe, private cd: ChangeDetectorRef, private apiService: ApiClientService, private userService: UserService, private dataService: DataService) {
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        document.onkeydown = function (evt) {
            evt = evt || window.event;
            if (this.isDialogOpen && evt.keyCode === 27) {
                this.resetAll(false);
            }
            if(evt.keyCode == 37)
                this.prevPeriod();

            if(evt.keyCode == 39)
                this.nextPeriod();
        }.bind(this);
        this.userService.collectGroupChanged.subscribe(() => {
            this.ngOnInit();
        });
    }

    ngAfterViewInit() {
        this.cd.detectChanges();
    }

    ngOnInit(): void {
        let firstDayFromStorage = this.dataService.getData("FirstDayOfWeek");
        this.firstDay = !isNaN(firstDayFromStorage) ? firstDayFromStorage : 0;
        this.events = [];
        this.headerConfig = {
            left: 'prev,next today',
            center: 'title',
            right: 'agendaWeek,agendaDay'
        };
        this.options['viewRender'] = function (view, element) {
            this.agendaView = view;
            this.isMonthView = view["type"] === "month";
            let start = new Date(view.start['_d'].toISOString());
            let end = new Date(view.end['_d'].toISOString());
            this.currentViewStart = this.datePipe.toISODateUTC(new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0));
            this.currentViewEnd = this.datePipe.toISODateUTC(new Date(end.getFullYear(), end.getMonth(), end.getDate(), 0, 0, 0));
            this.events.length = 0;
            this.cd.detectChanges();
            this.checkAllocationsV2();
        }.bind(this);
        this.options['eventAfterRender'] = function (event, element, view) {
            this.eventAfterRender(event, element, view);
        }.bind(this);
        this.options['eventRender'] = function (event, element, view) {
            this.eventRender(this, event, element, view);
        }.bind(this);
        this.options['eventAfterAllRender'] = function (view) {
            // this.filteredEvents();
        }.bind(this);
        this.options["contentHeight"] = "auto";
        this.options["eventClick"] = function (event, jsEvent, view) {
            this.openBucket(event);
            if (this.oldJsEvent !== undefined) {
                this.oldJsEvent.target.style.boxShadow = "0px 0px 15px transparent";
            }
            jsEvent.target.style.boxShadow = "0px 0px 15px #2E2957";
            this.oldJsEvent = jsEvent;

            let start = event.start;
            let end = event.end;
            if (view.name === 'month') {
                start.stripTime();
                end.stripTime();
            }
        }.bind(this);
        this.options['nowIndicator'] = false;
        this.options['firstDay'] = this.firstDay;
        this.options['slotDuration'] = '00:30:00';
        this.options['timezone'] = 'local';
        this.options['defaultView'] = 'agendaWeek';
        this.options['locale'] = this.ts.currentLang;
        this.options['eventDurationEditable'] = false;
        this.options['eventStartEditable'] = false;
        this.options['fixedWeekCount'] = false;
        this.options['unselectAuto'] = true;
        this.options['selectable'] = true;
        this.options['scrollTime'] = '08:00:00';
        this.options['select'] = function (start, end, jsEvent, view, resource) {
            this.createBucketWithRange(start["_d"], end["_d"]);

        }.bind(this);

        this.apiService.getData('Allocations/AllocationTags')
            .then(data => {
                this.usedTags = data;
            });
    }
    get allowButton(): Boolean {
        let retVal = true;
        this.selectedCard.Collects.forEach(collect => {
            if(collect.allocationId === 0)
                retVal = false;
        });
        return retVal;
    }
    createBucketWithRange(start: Date, end: Date){        
        let bigEvent = new MyEvent();
        bigEvent.start = new moment(start);
        bigEvent.end = new moment(end);   
        let countOfTransactions = this.events.filter((tx) => { return new Date(tx.start) >= start && new Date(tx.end) <= end;})
            .map((tx) => tx.transactions.length)
            .reduce((sum, amount) => sum + amount, 0);

        if(countOfTransactions > 0){
            bigEvent.transactions = this.events
                .filter((tx) => { return new Date(tx.start) >= start && new Date(tx.end) <= end;})
                .map((tx) => tx.transactions)
                .reduce((p,s) => p.concat(s));
            this.openBucket(bigEvent);
        }
    }
    openBucket(event: MyEvent){
        let bucketCard = new BucketCard();

        bucketCard.dtBegin = event.start["_d"];
        bucketCard.dtEnd = event.end["_d"];
        
        this.selectedAllocationDates = [event.start, event.end];

        bucketCard.Collects = [];
        for(let i = 0; i < 3; i++){
            if(event.transactions.filter((tx) => {
                return tx.CollectId === String(i+1);
            }).length > 0){
                bucketCard.Collects[i] = new BucketCardRow();
                bucketCard.Collects[i].allocationId = event.transactions.filter((tx) => {
                    return tx.CollectId === String(i+1);
                })[0].AllocationId;
                bucketCard.Collects[i].transactions = event.transactions.filter((tx) => {
                    return tx.CollectId === String(i+1);
                });
                bucketCard.Collects[i].allocationName = bucketCard.Collects[i].transactions[0].AllocationName;
                bucketCard.Collects[i].allocated = bucketCard.Collects[i].allocationName !== null;
                bucketCard.Collects[i].collectId = String(i+1);
            } 
        }

        bucketCard.Fixed = [];

        let fixedTransactions = event.transactions.filter((tx) => {
            return tx.CollectId === null;
        });

        let fixedNames = fixedTransactions.map((tx) => tx.AllocationName);
        fixedNames.forEach(name => {
            let fixedRow = new BucketCardRow();
            fixedRow.allocationName = name;
            fixedRow.transactions = fixedTransactions.filter((tx) => {
                return tx.AllocationName === name;
            });
            bucketCard.Fixed.push(fixedRow);
        });

        this.selectedCard = bucketCard;
        this.isDialogOpen = true;
        console.log(bucketCard);
    }
    renderBuckets(bucketCollection: BucketCollection){
        this.events = [];

        let buckets: Bucket[] = [];
        

        for(let i = 0; i < bucketCollection.Allocated.length; i++){
            let bucket = new Bucket();
            bucket.bucketType = BucketType.Allocated;
            bucket.dtBegin = bucketCollection.Allocated[i].dtBegin;
            bucket.dtEnd = bucketCollection.Allocated[i].dtEnd;
            bucket.Transactions = bucketCollection.Allocated[i].Transactions;

            let nonAllocated = bucketCollection.NonAllocated.filter((nonAllocation) => {
                return new Date(nonAllocation.dtBegin) >= new Date(bucket.dtBegin) && new Date(nonAllocation.dtEnd) <= new Date(bucket.dtEnd);
            });
            //filter out currently used non allocs
            bucketCollection.NonAllocated = bucketCollection.NonAllocated.filter((nonAllocation) => {
                return !(new Date(nonAllocation.dtBegin) >= new Date(bucket.dtBegin) && new Date(nonAllocation.dtEnd) <= new Date(bucket.dtEnd));
            });

            if(nonAllocated.length > 0)
                bucket.bucketType = BucketType.AllocatedWithNonAllocated;

            nonAllocated.forEach((b) => {
                bucket.Transactions = bucket.Transactions.concat(b.Transactions);
            });

            let fixed = bucketCollection.Fixed.filter((fixedAllocation) => {
                return new Date(fixedAllocation.dtBegin) >= new Date(bucket.dtBegin) && new Date(fixedAllocation.dtEnd) <= new Date(bucket.dtEnd);
            });
            bucketCollection.Fixed = bucketCollection.Fixed.filter((fixedAllocation) => {
                return !(new Date(fixedAllocation.dtBegin) >= new Date(bucket.dtBegin) && new Date(fixedAllocation.dtEnd) <= new Date(bucket.dtEnd));
            });
            fixed.forEach((f) => {
                bucket.Transactions = bucket.Transactions.concat(f.Transactions);
            });

            buckets.push(bucket);
        }

        for(let i = 0; i < bucketCollection.Fixed.length; i++){
            let bucket = new Bucket();
            bucket.bucketType = BucketType.Fixed;
            bucket.dtBegin = bucketCollection.Fixed[i].dtBegin;
            bucket.dtEnd = bucketCollection.Fixed[i].dtEnd;
            bucket.Transactions = bucketCollection.Fixed[i].Transactions;

            let nonAllocated = bucketCollection.NonAllocated.filter((nonAllocation) => {
                return new Date(nonAllocation.dtBegin) >= new Date(bucket.dtBegin) && new Date(nonAllocation.dtEnd) <= new Date(bucket.dtEnd);
            });
            //filter out currently used non allocs
            bucketCollection.NonAllocated = bucketCollection.NonAllocated.filter((nonAllocation) => {
                return !(new Date(nonAllocation.dtBegin) >= new Date(bucket.dtBegin) && new Date(nonAllocation.dtEnd) <= new Date(bucket.dtEnd));
            });

            if(nonAllocated.length > 0)
                bucket.bucketType = BucketType.AllocatedWithNonAllocated;

            nonAllocated.forEach((b) => {
                bucket.Transactions = bucket.Transactions.concat(b.Transactions);
            });

            buckets.push(bucket);
        }

        //render overgebleven non allocs
        for(let i = 0; i < bucketCollection.NonAllocated.length; i++) {
            let bucket = new Bucket();
            bucket.bucketType = BucketType.NonAllocated;
            bucket.dtBegin = bucketCollection.NonAllocated[i].dtBegin;
            bucket.dtEnd = bucketCollection.NonAllocated[i].dtEnd;
            bucket.Transactions = bucketCollection.NonAllocated[i].Transactions;
            buckets.push(bucket);
        }

        for(let i = 0; i < buckets.length; i++){
            let event = new MyEvent();
            event.id = i;
            event.start = new moment(new Date(buckets[i].dtBegin));
            event.end = new moment(new Date(buckets[i].dtEnd));
            event.transactions = buckets[i].Transactions;
            switch (buckets[i].bucketType) {
                case BucketType.Allocated:
                    event.className = "allocation";
                    break;
                case BucketType.AllocatedWithNonAllocated:
                    event.className = "allocation-mixed";
                    break;
                case BucketType.NonAllocated:
                    event.className = "money";
                    break;
                case BucketType.Fixed:
                    event.className = "allocation";
                    break;
            }
            this.events.push(event);
        }

    }
    checkAllocationsV2(){
        return new Promise((resolve, reject) => {
            let apiUrl = 'v2/CollectGroup/Buckets';
        if (this.currentViewStart !== null && this.currentViewEnd !== null) {
            apiUrl += "?dtBegin=" + this.currentViewStart + "&dtEnd=" + this.currentViewEnd;
        }

        this.isLoading = true;
        this.apiService.getData(apiUrl)
            .then(resp => {
                this.isLoading = false;

                if(resp === undefined) {
                    return;
                }

                let bucketCollection = resp as BucketCollection;

                this.renderBuckets(bucketCollection);

                console.log(this.events);

                // this.events.sort(function (a, b) {
                //     return a.start.getTime() - b.start.getTime();
                // });
                this.cd.detectChanges();

                resolve();
            })
            .catch(r => {
                reject();
            });
        });
        
        
    }

    loadDialog(event) {
        // if (event.id === this.openedMobileEventId) {
        //     this.closeDialog();
        //     this.openedMobileEventId = -1;
        //     return;
        // }
        // this.openedMobileEventId = event.id;
        // this.event = event;
        // this.startTime = new Date(this.event.start);
        // this.endTime = new Date(this.event.end);
        // this.openDialog();
    }

    prevPeriod() {
        let nativeElement = jQuery(this.calendar["el"]["nativeElement"].children[0]);
        nativeElement.fullCalendar('prev');
    }

    nextPeriod() {
        let nativeElement = jQuery(this.calendar["el"]["nativeElement"].children[0]);
        nativeElement.fullCalendar('next');
    }

    closeDialog() {
        this.resetAll(false);
        if (this.oldJsEvent !== undefined) {
            this.oldJsEvent.target.style.boxShadow = "0px 0px 15px transparent";
        }
    }

    filterTags(typed) {
        this.filteredUsedTags = [];
        let regex = new RegExp(typed, "i");
        this.usedTags.forEach(function (value) {
            if (value.search(regex) !== -1 && this.filteredUsedTags.length < 10 && value.trim() !== "") {
                let hlight = "<span class='autocomplete'>" + value.match(regex)[0] + "</span>";
                this.filteredUsedTags.push(value.replace(regex, hlight));
            }
        }, this);
    }

    // setCollectNameOf(item, aCollection: AssignedCollection) {
    //     aCollection.name = item.replace("<span class='autocomplete'>", "").replace("</span>", "");
    //     aCollection.isTyping = false;
    // }

    saveAllEvents() {  
        return new Promise((resolve,reject) => {
            this.selectedCard.Collects.forEach(collect => {
                if(collect.allocationName !== null && collect.allocationName !== ""){
                    this.saveAllocation(collect.allocationName, collect.collectId, this.selectedCard.dtBegin, this.selectedCard.dtEnd);
                }
            });
            resolve();
        }).then(x => {
            this.checkAllocationsV2().then(a => {
                let currentEvent = this.events.filter((e) => {
                    return new Date(e.start).getTime() === new Date(this.selectedAllocationDates[0]).getTime() && 
                            new Date(e.end).getTime() === new Date(this.selectedAllocationDates[1]).getTime();
                })[0];
                this.createBucketWithRange(currentEvent.start, currentEvent.end);
            });
        });
        
    }

    resetAll(reload: boolean = true) {
        // this.firstCollection = new AssignedCollection();
        // this.secondCollection = new AssignedCollection();
        // this.thirdCollection = new AssignedCollection();
        // this.showDelete = false;
        // this.isDialogOpen = false;
        // this.event = new MyEvent();
        // this.startTime = new Date();
        // this.endTime = new Date();
        // this.selectedAllocation = 0;
        // this.filteredUsedTags = [];
        // this.openedMobileEventId = -1;
        // if (this.oldJsEvent !== undefined) {
        //     this.oldJsEvent.target.style.boxShadow = "0px 0px 15px transparent";
        // }
        // if (reload) {
        //     this.reloadEvents();
        // }
    }

    reloadEvents() {
        this.events.length = 0;
        this.checkAllocationsV2();
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
        if (e.view.name === 'month') {
            start.stripTime();
            end.stripTime();
        }

        if (end) {
            this.event.end = end.format();
        }

        this.event.id = e.calEvent.id;
        this.event.start = start.format();
        this.openBucket(e);
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
        for (let i = 0; i < thisEvent.transactions.length; i++) {
            allocationsIds.push(thisEvent.transactions[i].AllocationId);
        }

        allocationsIds = allocationsIds.filter((item, i, ar) => {
            return ar.indexOf(item) === i;
        });

        for (let id of allocationsIds) {
            if (id !== 0) {
                promises.push(this.apiService.deleteData('Allocations/Allocation?Id=' + id));
            }
        }

        Promise.all(promises).then(() => {
            this.resetAll();
        }).catch((err) => {
            console.log(err);

        });

    }

    findEventIndexById(id: number) {
        let index = -1;
        for (let i = 0; i < this.events.length; i++) {
            if (id === this.events[i].id) {
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

    

    saveAllocation(title: string, collectId: string, startTime: Date = null, endTime: Date = null) {
        return new Promise((resolve, reject) => {
            if (title === "") {
                resolve();
                return;
            }
            
            let body = {};
            body["name"] = title;
            body["dtBegin"] = startTime == null ? this.startTime.toISOString() : startTime;
            body["dtEnd"] = endTime == null ? this.endTime.toISOString() : endTime;
            body["CollectId"] = collectId;
            this.apiService.postData("Allocations/Allocation", body)
                .then(resp => {
                    if (resp.status === 409) {
                        this.toggleError(true, "Je zit met een overlapping");
                    }
                    if (!this.usedTags.some(function (element) {
                        if (element.toLowerCase() === title.toLowerCase())
                            return true;
                    })) {
                        this.usedTags.push(title);
                    }
                    resolve(resp); // <- this returns integer of added row id
                })
                .catch(err => {
                    console.log(err);
                    reject();
                });
        });
    }
    showAllocActions(alloc: BucketCardRow){
        if(alloc.showActions)
            alloc.showActions = false;
        else if(!alloc.showActions && !alloc.showDetails){
            alloc.showDetails = true;
            alloc.showActions = true;            
        } 
        else
            alloc.showActions = true;
    }
    showAllocDetails(alloc: BucketCardRow){
        if(alloc.showDetails){
            alloc.showDetails = false; 
            if(alloc.showActions)
                alloc.showActions = false;
        }
        else
            alloc.showDetails = true;
        
    }
    removeThisAllocation(id: Number){
        console.log("Deleting allocation...");
        // this.apiService.deleteData('Allocations/Allocation?Id=' + id)
        return new Promise((resolve, reject) => {
            if (id <= 0) {
                resolve();
                return;
            }
            this.apiService.deleteData('Allocations/Allocation?Id=' + id)
                .then(resp => {
                    if (resp.status !== 200) {
                        console.log(resp);
                        return;
                    }
                    this.checkAllocationsV2().then(a => {
                        let currentEvent = this.events.filter((e) => {
                            return new Date(e.start).getTime() === new Date(this.selectedAllocationDates[0]).getTime() && 
                                    new Date(e.end).getTime() === new Date(this.selectedAllocationDates[1]).getTime();
                        })[0];
                        if(currentEvent !== undefined)
                            this.openBucket(currentEvent);
                        resolve(resp);
                    });
                })
                .catch(err => {
                    console.log(err);
                    reject();
                });
        });
    }
    updateThisAllocation(id: Number){
        console.log("Updating allocation...");
        return new Promise((resolve, reject) => {
            if (id <= 0) {
                resolve();
                return;
            }
            this.apiService.deleteData('v2/Allocations/Allocation/Update?Id=' + id)
                .then(resp => {
                    if (resp.status !== 200) {
                        console.log("Response code: 200;");
                        return;
                    }
                    else {
                        resolve(resp);
                        console.log(resp);
                    }
                })
                .catch(err => {
                    console.log(err);
                    reject();
                });
        });
    }
    saveThisAllocation(name: string, collectId:string, dtBegin: Date, dtEnd: Date){
        console.log("Saving allocation...");
        return new Promise((resolve, reject) => {
            if(name !== null && collectId !== null && dtBegin !== null, dtEnd !== null){
                this.saveAllocation(name, collectId, dtBegin, dtEnd)
                .then(resp => {
                    this.checkAllocationsV2().then(c => {
                        let currentEvent = this.events.filter((e) => {
                            return new Date(e.start).getTime() === new Date(this.selectedAllocationDates[0]).getTime() && 
                                    new Date(e.end).getTime() === new Date(this.selectedAllocationDates[1]).getTime();
                        })[0];
                        this.openBucket(currentEvent);
                    });
                });
            }
        });
            
    }

    eventAfterRender(event: any, element: any, view: any) {

    }

    eventRender(that: any, event: any, element: any, view: any) {
        element[0].innerText = event.title;


        element[0].addEventListener("mouseover", function (ev) {

            let div = document.createElement("div");
            div.innerHTML = "<span>" + this.ts.instant("ClickToViewMoreInformation") + "</span>";
            div.className = "balloon";
            let offsets = ev.srcElement.getBoundingClientRect();
            let top = offsets.top;
            let left = offsets.left;
            //div.style.top = top - div.offsetHeight +"px";
            div.style.left = left + "px";
            document.getElementsByClassName("section-page")[0].appendChild(div);
            div.style.top = top - div.offsetHeight - 17 + "px";

        }.bind(this));
        element[0].addEventListener("mouseleave", function () {

            let b = document.getElementsByClassName("balloon");
            while (b.length > 0) {
                b[0].remove();
            }
        }, true);

        element[0].innerHTML = "";
    }

    // onFocusOutOf(aCollection: AssignedCollection) {
    //     setTimeout(() => {
    //         aCollection.isTyping = false;
    //         this.filteredUsedTags = [];
    //     }, 200);
    // }

    displayValue(x) {
        if (x === undefined) x = 0;
        let euro = "€";
        if (!navigator.language.includes('en'))
            euro += " ";
        return euro + (this.isSafari ? parseFloat(x).toFixed(2) : (x).toLocaleString(
            navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        );
    }

    showDate(x) {
        return x.toLocaleDateString(navigator.language, { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric' });
    }

    setWeekName(item) {
        this.allocateWeekName = item.replace("<span class='autocomplete'>", "").replace("</span>", "");
    }

    allocateWeek() {
        // TODO: Implement api call to save non allocations
    }

    focusAllCollectsTyping(focus) {
        // if (!focus) {
        //     let that = this;
        //     setTimeout(() => {
        //         that.allCollectTyping = focus;
        //     }, 150);
        // } else {
        //     this.allCollectTyping = focus;
        // }
    }

    allCollectNameChanging(event) {
        this.filterTags(event);
    }

    closeCSVBox() {
        this.selectedCSV = false;
        this.checkAllocationsV2();
    }

    uploadCSV() {
        if (this.addedAllocations.length > 0) {
            for (let i = 0; i < this.addedAllocations.length; i++) {
                let alloc = this.addedAllocations[i];
                if (alloc.error) {
                    this.csvError = true;
                    this.showCsvPopup = true;
                    alloc.error = true;
                    this.ts.get('CsvError').subscribe((res: string) => {
                        this.csvFileName = res;
                        alloc.errorMsg = res;
                    });
                    continue;
                }
            }
            this.showCsvPopup = true;
            this.ts.get('CsvSuccess').subscribe((res: string) => {
                this.csvFileName = "'" + this.csvFile.name + "'" + res;
            });
            this.isDialogOpen = true;
            this.csvError = false;

            for (let i = 0; i < this.addedAllocations.length; i++) {
                let alloc = this.addedAllocations[i];
                alloc.uploaded = false;
                alloc.uploading = true;
                this.saveAllocation(alloc.name.trim(), alloc.collectId.trim(), alloc.dtBegin, alloc.dtEnd)
                    .then(() => {
                        alloc.uploaded = true;
                        alloc.uploading = false;
                        alloc.error = false;
                    }).catch(() => {
                        alloc.uploading = false;
                        alloc.uploaded = false;
                        alloc.error = true;
                        if(!alloc.errorMsg) {
                            this.ts.get('OverlapError').subscribe((res: string) => {
                                alloc.errorMsg = res;
                            });
                        }
                    });
            }
        }
    }
    downloadExampleCSV() {
        window.open('assets/Voorbeeld.csv');
    }
    fileChange(event) {
        this.selectedCSV = true;
        this.addedAllocations = [];
        let fileList: FileList = event.target.files;
        if (fileList.length > 0) {
            this.csvFile = fileList[0];
            let reader: FileReader = new FileReader();
            reader.readAsText(this.csvFile);
            reader.onload = (e) => {
                let csv: string = reader.result;
                let lineByLine = csv.split('\n');
                for (let i = 1; i < lineByLine.length; i++) {
                    let props = lineByLine[i].split(';');
                    if(props.length == 1) { // skip empty lines
                        continue;
                    }
                    let dtBegin = new Date(props[0]);
                    let dtEnd = new Date(props[1]);
                    let alloc;
                    let CollectId = props[3];

                    if (!this.isValidDate(dtBegin) || !this.isValidDate(dtEnd) || Number(CollectId) > 3 ) {
                        alloc = {
                            name: props[2],
                            dtBegin: dtBegin,
                            dtEnd: dtEnd,
                            collectId: props[3],
                            dtBeginString: new Date(props[0]).toLocaleDateString(navigator.language, { day: 'numeric', year: 'numeric', month: 'numeric', hour: 'numeric', minute: 'numeric' }),
                            dtEndString: new Date(props[1]).toLocaleDateString(navigator.language, { day: 'numeric', year: 'numeric', month: 'numeric', hour: 'numeric', minute: 'numeric' }),
                            error: true
                        };
                    } else {
                        alloc = {
                            name: props[2],
                            dtBegin: dtBegin,
                            dtEnd: dtEnd,
                            collectId: props[3],
                            dtBeginString: new Date(props[0]).toLocaleDateString(navigator.language, { day: 'numeric', year: 'numeric', month: 'numeric', hour: 'numeric', minute: 'numeric' }),
                            dtEndString: new Date(props[1]).toLocaleDateString(navigator.language, { day: 'numeric', year: 'numeric', month: 'numeric', hour: 'numeric', minute: 'numeric' })
                        };
                    }
                    this.addedAllocations.push(alloc);
                }
                (<HTMLInputElement>document.getElementById("inputfile")).value = '';
                this.uploadCSV();
            };
        }
    }

    isValidDate(d) {
        return d instanceof Date && !isNaN(d.getTime());
    }
    closePopup() {
        this.showCsvPopup = false;
    }
    deleteFutureAllocation(id) {
        let confirmMessage;
        this.ts.get('RemoveAllocationConfirm').subscribe((res: string) => { confirmMessage = res; });
        if (confirm(confirmMessage)) {
            this.apiService.deleteData('Allocations/Allocation?Id=' + id);
            for(var i = 0; i < this.events.length; i++){
                if(this.events[i].id === id){
                    this.events.splice(this.events.indexOf(this.events[i]),1);
                    break;
                }
            }
            this.closeDialog();
        };
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

export enum BucketType {
    Allocated,
    NonAllocated,
    Fixed,
    AllocatedWithNonAllocated,
}

export class BucketCollection {
    Allocated: Bucket[];
    NonAllocated: Bucket[];
    Fixed: Bucket[];
}

export class Bucket {
    dtBegin: Date;
    dtEnd: Date;
    Transactions: BucketTransaction[];
    bucketType: BucketType;
}

export class BucketTransaction {
    AllocationName: string = null;
    Sum: number;
    Count: number;
    CollectId: string;
    Status: number;
    Fixed: boolean;
}
export class BucketCard {
    dtBegin: Date;
    dtEnd: Date;
    Collects: BucketCardRow[];
    Fixed: BucketCardRow[];
}
export class BucketCardRow {
    allocationName: string;
    allocationId: number;
    transactions: BucketTransaction[];
    collectId: string;
    allocated: boolean;
    showActions: boolean;
    showDetails: boolean;

    get numberOfTransactions(): number {
        return this.transactions.map((tx) => tx.Count)
                                .reduce((sum, amount) => sum + amount, 0);
    }
    get toProcess():number {
        return this.transactions.filter((tx) => { return tx.Status === 1 || tx.Status === 2; })
                                .map((tx) => tx.Sum)
                                .reduce((sum, amount) => sum + amount, 0);
    }

    get processed():number {
        return this.transactions.filter((tx) => { return tx.Status === 3; })
                                .map((tx) => tx.Sum)
                                .reduce((sum, amount) => sum + amount, 0);
    }

    get refusedByBank():number {
        return this.transactions.filter((tx) => { return tx.Status === 4; })
                                .map((tx) => tx.Sum)
                                .reduce((sum, amount) => sum + amount, 0);
    }

    get cancelledByUser():number {
        return this.transactions.filter((tx) => { return tx.Status === 5; })
                                .map((tx) => tx.Sum)
                                .reduce((sum, amount) => sum + amount, 0);
    }

    get total():Number {
        return this.toProcess+this.processed+this.refusedByBank+this.cancelledByUser;
    }
}