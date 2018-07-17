import {Component, OnInit, ViewEncapsulation, ElementRef} from '@angular/core';
import {ApiClientService} from "app/services/api-client.service";
import {TranslateService} from "ng2-translate";
import {ViewChild, ChangeDetectorRef} from '@angular/core';
import 'fullcalendar';
import 'fullcalendar/dist/locale/nl';
import {AllocationTimeSpanItem} from "../models/allocationTimeSpanItem";
import {UserService} from "../services/user.service";
import {DataService} from "../services/data.service";
import {AgendaView} from "fullcalendar";
import {ISODatePipe} from "../pipes/iso.datepipe";

@Component({
    selector: 'app-assign-collects',
    templateUrl: '../html/assign.component.html',
    styleUrls: ['../css/assign.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AssignComponent implements OnInit {
    events: any[];
    headerConfig: any;
    options: Object = {};
    isDialogOpen: boolean;
    showDelete = false;
    event: MyEvent = new MyEvent();
    idGen = 100;
    errorShown: boolean;
    errorMessage: string;
    currentViewStart: any;
    currentViewEnd: any;
    allGivts: any;
    openGivts: any;
    openGivtsBucket: Array<AllocationTimeSpanItem> = [];
    isSafari: boolean;
    collectionTranslation: string;
    usersTransalation: string;
    notYetAllocated: string;
    allCollectTyping = false;
    usedTags: string[];
    filteredUsedTags: string[];
    allocateWeekName = "";
    numberOfFilteredEvents = 0;
    SelectedTab = SelectedTab;
    currentTab: SelectedTab = SelectedTab.Collects;
    allocatedGivts: any;
    fixedAllocations: Array<AssignedCollection> = [];
    startTime: Date;
    endTime: Date;
    oldJsEvent: any;
    openedMobileEventId = -1;
    private firstDay = 0;
    agendaView: AgendaView;

    csvFile: File;
    addedAllocations: Array<Object> = [];
    firstCollection = new AssignedCollection();
    secondCollection = new AssignedCollection();
    thirdCollection = new AssignedCollection();

    isLoading = false;

    @ViewChild('calendar') calendar: ElementRef;

    get allowButton(): boolean {
        if (this.firstCollection.amountOfGivts > 0 && this.firstCollection.allocated === false)
            return true;

        if (this.secondCollection.amountOfGivts > 0 && this.secondCollection.allocated === false)
            return true;

        return this.thirdCollection.amountOfGivts > 0 && this.thirdCollection.allocated === false;
    }

    get disableSaveButton(): boolean {
        for (let alloc of this.allocations) {
            if (alloc.amountOfGivts > 0 && alloc.name === "")
                return true;
        }
        return false;
    }

    get allocations(): Array<AssignedCollection> {
        return [this.firstCollection, this.secondCollection, this.thirdCollection];
    }

    get areAllocationsEmpty(): boolean {
        return this.allocations.filter((ac) => ac.amountOfGivts === 0).length === 3;
    }

    get areFixedAllocationsEmpty(): boolean {
        return this.fixedAllocations.length === 0;
    }

    filteredEvents() {
        if (this.events === undefined) {
            this.numberOfFilteredEvents = 0;
            return [];
        }

        let filtered = this.events.filter(
            events => events.allocated === false
        );
        this.numberOfFilteredEvents = filtered.length;
        return filtered;
    }

    public constructor(public ts: TranslateService, private datePipe: ISODatePipe, private cd: ChangeDetectorRef, private apiService: ApiClientService, private userService: UserService, private dataService: DataService) {
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

        document.onkeydown = function (evt) {
            evt = evt || window.event;
            if (this.isDialogOpen && evt.keyCode === 27) {
                this.resetAll(false);
            }
        }.bind(this);
        this.userService.collectGroupChanged.subscribe(() => {
            this.ngOnInit();
        });
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
            this.currentViewStart = view.start['_d'].toISOString();
            this.currentViewEnd = view.end['_d'].toISOString();
            console.log(this.currentViewStart);
            console.log(this.currentViewEnd);
            this.events.length = 0;
            this.checkAllocations();
        }.bind(this);
        this.options['eventAfterRender'] = function (event, element, view) {
            this.eventAfterRender(event, element, view);
        }.bind(this);
        this.options['eventRender'] = function (event, element, view) {
            this.eventRender(this, event, element, view);
        }.bind(this);
        this.options['eventAfterAllRender'] = function (view) {
            this.filteredEvents();
        }.bind(this);
        this.options["contentHeight"] = "auto";
        this.options["eventClick"] = function (event, jsEvent, view) {
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
            this.loadDialog(event);
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
            this.addAllocation(start["_d"], end["_d"]);
        }.bind(this);

        this.apiService.getData('Allocations/AllocationTags')
            .then(data => {
                this.usedTags = data;
            });
    }

    loadDialog(event) {
        if (event.id === this.openedMobileEventId) {
            this.closeDialog();
            this.openedMobileEventId = -1;
            return;
        }
        this.openedMobileEventId = event.id;
        this.event = event;
        this.startTime = new Date(this.event.start);
        this.endTime = new Date(this.event.end);
        this.fillData(event);
        this.openDialog();
    }

    prevPeriod() {
        let nativeElement = jQuery(this.calendar["el"]["nativeElement"].children[0]);
        nativeElement.fullCalendar('prev');
    }

    nextPeriod() {
        let nativeElement = jQuery(this.calendar["el"]["nativeElement"].children[0]);
        nativeElement.fullCalendar('next');
    }


    private openDialog() {
        console.log(this.event);
        this.isDialogOpen = true;
        if (this.allocations.filter((ts) => ts.amountOfGivts > 0).length > 0) {
            this.currentTab = SelectedTab.Collects;
        } else if (this.fixedAllocations.length > 0) {
            this.currentTab = SelectedTab.Fixed;
        } else {
            if (this.oldJsEvent !== undefined) {
                this.oldJsEvent.target.style.boxShadow = "0px 0px 15px transparent";
            }
        }
    }

    private fillData(event) {

        let fcEvent = event;

        let div = document.createElement("div");
        this.firstCollection = new AssignedCollection();
        this.secondCollection = new AssignedCollection();
        this.thirdCollection = new AssignedCollection();
        this.fixedAllocations = [];

        let fixedGivts = this.allGivts.filter((ts) => {
            return ts.Fixed != null && (new Date(ts["dt_Confirmed"])) >= this.startTime && (new Date(ts["dt_Confirmed"])) < this.endTime;
        });

        for (let g of fixedGivts) {
            let filteredFixedAllocations = this.fixedAllocations.filter((ts) => {
                return ts.name === g.Fixed;
            });
            if (filteredFixedAllocations.length > 0) {
                //name is in array, add to it.
                this.fillCollectBy(filteredFixedAllocations[0], g.Status, g.Amount);
            } else {
                let fixedAllocation = new AssignedCollection();
                fixedAllocation.name = g.Fixed;
                this.fillCollectBy(fixedAllocation, g.Status, g.Amount);
                this.fixedAllocations.push(fixedAllocation);
            }
        }
        let normalGivts = [];
        if (event.transactions !== undefined) {
            normalGivts = event.transactions.filter((g) => {
                return g.Fixed == null && (new Date(g["dt_Confirmed"])) >= this.startTime && (new Date(g["dt_Confirmed"])) < this.endTime;
            });
        }

        if (fcEvent.allocated) {
            if (normalGivts.length > 0) {
                for (let i = 0; i < normalGivts.length; i++) {
                    let tr = normalGivts[i];
                    if (tr.CollectId === "1") {
                        this.fillCollectBy(this.firstCollection, tr.Status, tr.Amount);
                        this.firstCollection.name = normalGivts[i].AllocationName;
                        this.firstCollection.allocated = true;
                        this.firstCollection.collectionNumber = 1;
                    } else if (tr.CollectId === "2") {
                        this.fillCollectBy(this.secondCollection, tr.Status, tr.Amount);
                        this.secondCollection.name = normalGivts[i].AllocationName;
                        this.secondCollection.allocated = true;
                        this.secondCollection.collectionNumber = 2;
                    } else if (tr.CollectId === "3") {
                        this.fillCollectBy(this.thirdCollection, tr.Status, tr.Amount);
                        this.thirdCollection.name = normalGivts[i].AllocationName;
                        this.thirdCollection.allocated = true;
                        this.thirdCollection.collectionNumber = 3;
                    }
                }
            }
            if (!fcEvent.amount) {
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
            if (normalGivts.length > 0) {
                this.firstCollection = new AssignedCollection();

                for (let i = 0; i < normalGivts.length; i++) {
                    let transaction = normalGivts[i];
                    if (transaction.CollectId === "1") {
                        //////
                        this.fillCollectBy(this.firstCollection, transaction.Status, transaction.Amount);
                        this.firstCollection.collectionNumber = 1;
                    } else if (transaction.CollectId === "2") {
                        this.fillCollectBy(this.secondCollection, transaction.Status, transaction.Amount);
                        this.secondCollection.collectionNumber = 2;
                    } else if (transaction.CollectId === "3") {
                        this.fillCollectBy(this.thirdCollection, transaction.Status, transaction.Amount);
                        this.thirdCollection.collectionNumber = 3;
                    }
                }

            }
            div.innerHTML = "<span>Click the item to view more information</span>";
            div.className = "balloon";
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

    setCollectNameOf(item, aCollection: AssignedCollection) {
        aCollection.name = item.replace("<span class='autocomplete'>", "").replace("</span>", "");
        aCollection.isTyping = false;
    }

    addAllocation(start, end) {
        this.fixedAllocations = [];
        this.firstCollection = new AssignedCollection();
        this.secondCollection = new AssignedCollection();
        this.thirdCollection = new AssignedCollection();
        let openGivts = this.openGivts.filter((ts) => {
            return ts.Fixed == null;
        });
        let fixedGivts = this.allGivts.filter((ts) => {
            return ts.Fixed != null && (new Date(ts["dt_Confirmed"])) >= new Date(start) && (new Date(ts["dt_Confirmed"])) < new Date(end);
        });
        if (openGivts.length === 0 && fixedGivts.length === 0) {
            this.openDialog();
            return;
        }

        let check = false;
        this.firstCollection = new AssignedCollection();
        this.secondCollection = new AssignedCollection();
        this.thirdCollection = new AssignedCollection();

        for (let g of fixedGivts) {
            check = true;
            let filteredFixedAllocations = this.fixedAllocations.filter((ts) => {
                return ts.name === g.Fixed;
            });
            if (filteredFixedAllocations.length > 0) {
                //name is in array, add to it.
                this.fillCollectBy(filteredFixedAllocations[0], g.Status, g.Amount);
            } else {
                let fixedAllocation = new AssignedCollection();
                fixedAllocation.name = g.Fixed;
                this.fillCollectBy(fixedAllocation, g.Status, g.Amount);
                this.fixedAllocations.push(fixedAllocation);
            }
        }


        for (let i = 0; i < openGivts.length; i++) {
            let dtConfirmed = new Date(openGivts[i]["dt_Confirmed"]);
            let dtStart = new Date(start);
            let dtEnd = new Date(end);
            if (dtConfirmed > dtStart && dtConfirmed < dtEnd) {


                check = true;
                switch (openGivts[i].CollectId) {
                    case "1":
                        this.fillCollectBy(this.firstCollection, openGivts[i].Status, openGivts[i].Amount);
                        this.firstCollection.collectionNumber = 1;
                        break;
                    case "2":
                        this.fillCollectBy(this.secondCollection, openGivts[i].Status, openGivts[i].Amount);
                        this.secondCollection.collectionNumber = 2;

                        break;
                    case "3":
                        this.fillCollectBy(this.thirdCollection, openGivts[i].Status, openGivts[i].Amount);
                        this.thirdCollection.collectionNumber = 3;

                        break;
                    default:
                        break;
                }
            }
        }
        this.openDialog();
        if (check) {
            this.startTime = new Date(start);
            this.endTime = new Date(end);

        }
    }

    checkAllocations() {
        let apiUrl = 'Allocations/AllocationCheck';
        if (this.currentViewStart !== null && this.currentViewEnd !== null) {
            apiUrl += "?dtBegin=" + this.currentViewStart + "&dtEnd=" + this.currentViewEnd;
        }

        this.isLoading = true;
        this.apiService.getData(apiUrl)
            .then(resp => {
                this.isLoading = false;
                this.allGivts = resp;

                this.openGivts = resp.filter((ts) => {
                    return ts.AllocationName == null && ts.Fixed == null;
                });

                this.allocatedGivts = resp.filter((ts) => {
                    return !(ts.AllocationName == null && ts.Fixed == null);
                });

                this.openGivtsBucket = [];

                this.renderOpenGivts();
                this.renderAllocatedGivts();

                this.events.sort(function (a, b) {
                    return a.start.getTime() - b.start.getTime();
                });
            });
    }

    saveAllEvents() {
        let promises = [];
        let collections: Array<AssignedCollection> = [this.firstCollection, this.secondCollection, this.thirdCollection];

        //count number of collections that have givts + count the collections with a name. when it's not equal
        //this means that there are still open allocations
        let allocationsWithGivts = collections.filter((d) => d.amountOfGivts !== 0).length;
        let allocationsWithNames = collections.filter((d) => d.name !== "").length;
        if (allocationsWithGivts !== allocationsWithNames) {
            //err: has open allocs
            return;
        }

        for (let i = 0; i < collections.length; i++) {
            let current = collections[i];

            if (current.amountOfGivts > 0 && current.name !== "") {
                promises.push(this.saveAllocation(current.name, String(i + 1)));
            }
        }
        Promise.all(promises.map(p => p.catch(e => e)))
            .then(results => {
                let promisesWithResults = results.filter((e) => e !== undefined);
                if (promisesWithResults.length === promises.length) {
                    //all went good
                    this.isDialogOpen = false;
                    this.reloadEvents();
                } else {
                    //cancel previous allocs
                    this.errorShown = true;
                    if (promisesWithResults.length > 0) {

                        let cancelPromises = [];
                        for (let p of promisesWithResults) {
                            cancelPromises.push(this.apiService.deleteData('Allocations/Allocation?Id=' + p.id));
                        }

                        //delete previous added allocations
                        Promise.all(cancelPromises).then(() => {
                            //promises
                        });

                    }
                }
            }).catch(e => console.log(e));
    }

    renderAllocatedGivts() {
        this.isDialogOpen = false;
        let buckets: Bucket[] = [];

        let noFixed = this.allocatedGivts.filter((ts) => ts.Fixed == null);
        for (let x = 0; x < noFixed.length; x++) {
            let startTime = new Date(noFixed[x]['dtBegin']);
            let endTime = new Date(noFixed[x]['dtEnd']);
            noFixed[x]['dtBegin'] = startTime;
            noFixed[x]['dtEnd'] = endTime;
            let filteredBuckets = buckets.filter((b) => b.startTime.getTime() === noFixed[x]['dtBegin'].getTime() && b.endTime.getTime() === noFixed[x]['dtEnd'].getTime());
            if (filteredBuckets.length === 0) {
                //transaction does not fit into bucket
                //create new bucket and add to array
                let newBucket = new Bucket();

                newBucket.startTime = startTime;
                newBucket.endTime = endTime;
                newBucket.allocationName = noFixed[x].AllocationName;
                newBucket.allocationId = noFixed[x].AllocationId;
                newBucket.transactions = [];
                buckets.push(newBucket);
            }

            let currentBucket = buckets.filter((b) => b.startTime.getTime() === noFixed[x]['dtBegin'].getTime() && b.endTime.getTime() === noFixed[x]['dtEnd'].getTime())[0];
            currentBucket.transactions.push(noFixed[x]);
        }

        for (let i = 0; i < buckets.length; i++) {
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

        let fixedGivts = this.allGivts.filter((ts) => {
            return ts.Fixed != null;
        });
        this.fixedAllocations = [];
        for (let g of fixedGivts) {

            let startTime = new Date(g['dt_Confirmed']);
            let endTime = new Date(g['dt_Confirmed']);
            if (startTime.getMinutes() < 30) {
                startTime.setMinutes(0, 0, 0);
                endTime.setMinutes(30, 0, 0);
            } else {
                startTime.setMinutes(30, 0, 0);
                endTime.setHours(endTime.getHours() + 1, 0, 0, 0);
            }

            g.dtBegin = new Date(startTime);
            g.dtEnd = new Date(endTime);

            let filteredFixedAllocations = this.fixedAllocations.filter((ts) => {
                return ts.name === g.Fixed && ts.dtBegin.getTime() === g.dtBegin.getTime() && ts.dtEnd.getTime() === g.dtEnd.getTime();
            });
            if (filteredFixedAllocations.length > 0) {
                //name is in array, add to it.
                this.fillCollectBy(filteredFixedAllocations[0], g.Status, g.Amount);
            } else {
                let fixedAllocation = new AssignedCollection();
                fixedAllocation.name = g.Fixed;
                fixedAllocation.dtBegin = new Date(startTime);
                fixedAllocation.dtEnd = new Date(endTime);
                this.fillCollectBy(fixedAllocation, g.Status, g.Amount);
                this.fixedAllocations.push(fixedAllocation);
            }
        }


        for (let i = 0; i < this.fixedAllocations.length; i++) {
            let event = new MyEvent();
            event.start = this.fixedAllocations[i].dtBegin;
            event.end = this.fixedAllocations[i].dtEnd;
            event.className = "allocation";
            event.allocated = true;
            event.amount = null;
            let temp = this.events.filter((e) => {
                return e.start.getTime() <= this.fixedAllocations[i].dtBegin.getTime() && this.fixedAllocations[i].dtEnd.getTime() <= e.end.getTime();
            });
            if (temp.length === 0) {
                this.events.push(event);
            }

        }
    }

    renderOpenGivts() {
        for (let x = 0; x < this.openGivts.length; x++) {
            let startTime = new Date(this.openGivts[x]['dt_Confirmed']);
            let endTime = new Date(this.openGivts[x]['dt_Confirmed']);
            if (startTime.getMinutes() < 30) {
                startTime.setMinutes(0, 0, 0);
                endTime.setMinutes(30, 0, 0);
            } else {
                startTime.setMinutes(30, 0, 0);
                endTime.setHours(endTime.getHours() + 1, 0, 0, 0);
            }

            let check = false;
            for (let i = 0; i < this.openGivtsBucket.length; i++) {
                if (this.openGivtsBucket[i].dtStart.getTime() === startTime.getTime()) {
                    this.openGivtsBucket[i].transactions.push(this.openGivts[x]);
                    check = false;
                    break;
                }
                check = true;
            }
            if (check) {
                let item = new AllocationTimeSpanItem();
                item.dtEnd = endTime;
                item.dtStart = startTime;
                item.transactions = [];
                item.transactions.push(this.openGivts[x]);
                this.openGivtsBucket.push(item);
            }
            if (this.openGivtsBucket.length === 0) {
                let item = new AllocationTimeSpanItem();
                item.dtEnd = endTime;
                item.dtStart = startTime;
                item.transactions = [];
                item.transactions.push(this.openGivts[x]);
                this.openGivtsBucket.push(item);
            }
        }
        for (let count = 0; count < this.openGivtsBucket.length; count++) {
            let buckets = <any>this.openGivtsBucket[count]['transactions'];
            let amount = 0;
            for (let tr = 0; tr < buckets.length; tr++) {
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

    resetAll(reload: boolean = true) {
        this.firstCollection = new AssignedCollection();
        this.secondCollection = new AssignedCollection();
        this.thirdCollection = new AssignedCollection();
        this.showDelete = false;
        this.isDialogOpen = false;
        this.event = new MyEvent();
        this.startTime = new Date();
        this.endTime = new Date();
        this.filteredUsedTags = [];
        if (reload) {
            this.reloadEvents();
        }
    }

    reloadEvents() {
        this.events.length = 0;
        this.checkAllocations();
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
        if (!e.calEvent.allocated) {
            let dStart = new Date(this.event.start);
            let dEnd = new Date(this.event.end);
            this.addAllocation(dStart, dEnd);
        } else {

            this.openDialog();
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
            let event = new MyEvent();
            event.id = this.idGen++;
            event.title = title;
            event.collectId = collectId;

            event.start = startTime == null ? this.startTime : startTime;
            event.end = endTime == null ? this.endTime : endTime;

            let body = {};
            body["name"] = title;
            body["dtBegin"] = startTime == null ? this.startTime.toISOString() : startTime;
            body["dtEnd"] = endTime == null ? this.endTime.toISOString() : endTime;
            body["CollectId"] = collectId;
            this.apiService.postData("Allocations/Allocation", body)
                .then(resp => {
                    resolve(resp);
                    if (resp.status === 409) {
                        this.toggleError(true, "Je zit met een overlapping");
                    }
                    if (!this.usedTags.some(function (element) {
                        if (element.toLowerCase() === title.toLowerCase())
                            return true;
                    })) {
                        this.usedTags.push(title);
                    }

                })
                .catch(err => {
                    console.log(err);
                    reject();
                });
        });

    }

    eventAfterRender(event: any, element: any, view: any) {

    }

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

    onFocusOutOf(aCollection: AssignedCollection) {
        setTimeout(() => {
            aCollection.isTyping = false;
            this.filteredUsedTags = [];
        }, 200);
    }

    displayValue(x) {
        if (x === undefined) x = 0;
        let euro = "€";
        if (!navigator.language.includes('en'))
            euro += " ";
        return euro + (this.isSafari ? parseFloat(x).toFixed(2) : (x).toLocaleString(
                navigator.language, {minimumFractionDigits: 2, maximumFractionDigits: 2})
        );
    }

    setWeekName(item) {
        this.allocateWeekName = item.replace("<span class='autocomplete'>", "").replace("</span>", "");
    }

    allocateWeek() {
        for (let i = 0; i < this.filteredEvents().length; i++) {
            let obj = this.filteredEvents()[i];
            let coll1 = false, coll2 = false, coll3 = false;
            for (let idx = 0; i < obj.transactions.length; i++) {
                switch (obj.transactions[idx].CollectId) {
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
                        //console.log("unknown coll");
                        break;
                }
            }
            if (coll1) {
                this.saveAllocation(this.allocateWeekName, "1", obj.start, obj.end).then(function () {
                });
            }
            if (coll2) {
                this.saveAllocation(this.allocateWeekName, "2", obj.start, obj.end).then(function () {
                });
            }
            if (coll3) {
                this.saveAllocation(this.allocateWeekName, "3", obj.start, obj.end).then(function () {
                });
            }
        }
        setTimeout(() => {
            this.allocateWeekName = "";
            this.resetAll();
            this.filterTags("");
        }, 250);
    }

    focusAllCollectsTyping(focus) {
        if (!focus) {
            let that = this;
            setTimeout(() => {
                that.allCollectTyping = focus;
            }, 150);
        } else {
            this.allCollectTyping = focus;
        }
    }

    allCollectNameChanging(event) {
        this.filterTags(event);
    }

    closeDialog() {
        this.isDialogOpen = false;
        if (this.oldJsEvent !== undefined) {
            this.oldJsEvent.target.style.boxShadow = "0px 0px 15px transparent";
        }
    }

    uploadCSV() {
        if (this.csvFile) {
            this.addedAllocations = [];
            let reader: FileReader = new FileReader();
            reader.readAsText(this.csvFile);
            reader.onload = (e) => {
                let csv: string = reader.result;
                let lineByLine = csv.split('\n');
                for (let i = 1; i < lineByLine.length; i++) {
                    let props = lineByLine[i].split(',');
                    let alloc = {
                        name: props[2],
                        dtBegin: new Date(props[0]),
                        dtEnd: new Date(props[1]),
                        collectId: props[3],
                        dtBeginString: new Date(props[0]).toLocaleDateString(navigator.language, { day:'numeric', year: 'numeric', month: 'long', hour:'numeric', minute:'numeric'}),
                        dtEndString: new Date(props[1]).toLocaleDateString(navigator.language, { day:'numeric', year: 'numeric', month: 'long', hour:'numeric', minute:'numeric'}),
                        uploading: true,
                        uploaded: false,
                        error: false
                    };
                    this.saveAllocation(alloc.name, alloc.collectId, alloc.dtBegin, alloc.dtEnd)
                        .then( () => {
                            alloc.uploaded = true;
                            alloc.uploading = false;
                            alloc.error = false;
                        }).catch(() => {
                            alloc.uploading = false;
                            alloc.uploaded = false;
                            alloc.error = true;
                    });
                    this.addedAllocations.push(alloc);
                    console.log(alloc);
                }
            };
        } else {
            alert('No file selected.');
        }
    }

    fileChange(event) {
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
                    let props = lineByLine[i].split(',');
                    let alloc = {
                        name: props[2],
                        dtBegin: new Date(props[0]),
                        dtEnd: new Date(props[1]),
                        collectId: props[3],
                        dtBeginString: new Date(props[0]).toLocaleDateString(navigator.language, { day:'numeric', year: 'numeric', month: 'long', hour:'numeric', minute:'numeric'}),
                        dtEndString: new Date(props[1]).toLocaleDateString(navigator.language, { day:'numeric', year: 'numeric', month: 'long', hour:'numeric', minute:'numeric'})
                    };
                    this.addedAllocations.push(alloc);
                }
            };
        }
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
    amountOfGivts: number;
    name: string;
    isTyping: boolean;
    state: ButtonState;
    allocated: boolean;
    collectionNumber: number;
    dtBegin: Date;
    dtEnd: Date;
    isStatsHidden = true;

    constructor(toProcessTotal = 0, processedTotal = 0, refusedByBank = 0, cancelByGiver = 0, amountOfGivts = 0, name = "", isTyping = false, state = ButtonState.Enabled, allocated = false, collectionNumber = 1) {
        this.toProcessTotal = toProcessTotal;
        this.processedTotal = processedTotal;
        this.refusedBank = refusedByBank;
        this.cancelByGiver = cancelByGiver;
        this.amountOfGivts = amountOfGivts;
        this.name = name;
        this.isTyping = false;
        this.state = state;
        this.allocated = allocated;
        this.collectionNumber = collectionNumber;
    }
}
