import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ApiClientService } from "app/services/api-client.service";
import { TranslateService } from "ng2-translate";
import { CalendarModule } from "primeng/primeng";
import { Collection } from "../models/collection";
import { DataService } from "../services/data.service";
import { UserService } from "../services/user.service";
import { visualCollection } from "../models/visualCollection";
import { BaseChartDirective } from "ng2-charts";
import { ISODatePipe } from "../pipes/iso.datepipe";
import { PaymentType } from "../models/paymentType";

@Component({
    selector: 'my-collects',
    templateUrl: '../html/collects.component.html',
    styleUrls: ['../css/collects.component.css'],
    encapsulation: ViewEncapsulation.None
})

export class CollectsComponent implements OnInit {
    @ViewChild(BaseChartDirective) chart: BaseChartDirective;
    isDataAvailable: boolean = false;
    infoToProcess: visualCollection;
    infoProcessed: visualCollection;
    infoCancelledByBank: visualCollection;
    infoCancelledByUser: visualCollection;
    totalAmountsCombined: number = 0;

    infoButtonShouldHavePopover = [false, false, false, false];

    text: string;
    calendarModule: CalendarModule;
    dateBegin: Date = null;
    dateEnd: Date = null;
    value: string = "";
    dateBeginTime: number;
    maxDate: Date;
    isVisible: boolean = false;
    dateBeginRange: any;
    dateEndRange: any;

    sameDate: boolean;
    isSafari: boolean;
    savedCollects: Collection[] = [];
    collectName: string = null;
    collectId: number = null;
    showCosts: boolean = false;

    SearchButtonGreen: boolean = false;

    activeRow: number = 1;

    multipleCollects: boolean = false;
    multipleCollectsId: string;


    ShowLoadingAnimation = false;
    terms: any = {
        en: {
            firstDayOfWeek: 0,
            dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        },
        nl: {
            firstDayOfWeek: 1,
            closeText: 'Sluiten',
            prevText: 'Terug',
            nextText: 'Volgende',
            currentText: 'Huidig',
            monthNames: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
            monthNamesShort: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
            dayNames: ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'],
            dayNamesShort: ['zo', 'ma', 'di', 'woe', 'do', 'vr', 'za'],
            dayNamesMin: ['Zo', 'Ma', 'Di', 'Wo ', 'Do', 'Vr ', 'Za'],
            weekHeader: 'Week',
            firstDay: 1,
            isRTL: false,
            showMonthAfterYear: false,
            yearSuffix: '',
            timeOnlyTitle: 'Alleen tijd',
            timeText: 'Tijd',
            hourText: 'Uur',
            minuteText: 'Minuut',
            secondText: 'Seconde',
            ampm: false,
            month: 'Maand',
            week: 'week',
            day: 'Dag',
            allDayText: 'Alle Dagen'
        }
    };
    toProcessExplanation: string;
    locale: any;

    dateRange: Date;
    timeRange: string;

    inputTitleLength: number = 1;
    openAllocations: boolean = false;
    openAllocationsMessage: string;

    public pieChartLabels: string[] = [this.translate.instant("Text_Export").toString(), 'Verwerkt', 'Geweigerd', "Geannuleerd"];
    public pieChartData: number[] = [0, 0, 0, 0];
    public pieChartType: string = 'pie';
    public chartColors: any[] = [
        {
            backgroundColor: ["#494874", "#41C98E", "#D43D4C", "#9B96B0"]
        }];
    selectedIndex: number = -1;
    public pieChartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            display: false
        },
        borderWidth: 0,
        tooltips: {
            filter: function (tooltipItem, data) {
                return data.datasets[0].data[tooltipItem.index] != 0;
            },
            bodyFontColor: 'rgb(44,43,87)',
            backgroundColor: 'rgb(255,255,255)',
            callbacks: {
                label: function (tooltipItem, data) {
                    let val = data.datasets[0].data[tooltipItem.index];
                    let label = data.labels[tooltipItem.index];
                    let amount = this.displayValue(val);
                    return label + ": " + amount;
                }.bind(this)
            }
        },
        hover: {
            onHover: (event, active) => {
                if (active && active.length) {
                    let index = active[0]._index; //with this you get the index of the segment you hovered on
                    this.selectedIndex = index;
                }
            }
        }
    };

    public resetInfoButtonsPopovers(position: number) {
        this.infoButtonShouldHavePopover = [false, false, false, false];
    }

    ngOnInit() {
        this.checkAllocations();
        this.fetchSavedCollects();
        this.translate.get('ToProcessExplanation').subscribe((res: string) => {
            this.toProcessExplanation = this.userService.CurrentCollectGroup.PaymentType === PaymentType.BACS ? res.replace('SlimPay', 'Access PaySuite') : res;
        });
    }

    constructor(private apiService: ApiClientService, private translate: TranslateService, private datePipe: ISODatePipe, private dataService: DataService, private userService: UserService) {
        this.locale = navigator.language.includes('nl') ? 'nl-NL' : 'en-GB';
        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        switch (this.translate.currentLang) {
            case "nl":
                this.locale = this.terms.nl;
                break;
            case "en":
                this.locale = this.terms.en;
                break;
            default:
                this.locale = this.terms.en;
                break;
        }
        this.apiService = apiService;
        this.text = "dit zijn de collectes";
        this.calendarModule = new CalendarModule();
        this.dateBeginTime = 5000;
        this.maxDate = new Date();
        this.dateBegin = new Date();
        this.dateEnd = new Date();
        this.dateBegin.setHours(6, 0, 0);

        if (!!this.dataService.getData('collectDateBegin') && !!this.dataService.getData('collectDateEnd')) {
            this.dateBegin = new Date(Number(this.dataService.getData('collectDateBegin')) * 1000);
            this.dateEnd = new Date(Number(this.dataService.getData('collectDateEnd')) * 1000);
        }

        this.userService.collectGroupChanged.subscribe(() => {
            this.ngOnInit();
        });
    }

    checkAllocations() {
        let apiUrl = 'v2/collectgroups/' +
            this.userService.CurrentCollectGroup.GUID +
            '/allocations/non-allocated/date-bounds';

        this.apiService.getData(apiUrl)
            .then(resp => {
                if (resp) {
                    if (resp.length === 2) {
                        this.openAllocations = true;
                        let dtBegin = new Date(resp[0].dt_Confirmed);
                        let dtEnd = new Date(resp[1].dt_Confirmed);
                        this.openAllocationsMessage = this.translate.instant("MultipleOpenAllocationsMessage");
                        this.openAllocationsMessage = this.openAllocationsMessage.replace("{0}", dtBegin.toLocaleDateString(navigator.language, {
                            day: 'numeric', month: 'numeric', year: 'numeric'
                        }));
                        this.openAllocationsMessage = this.openAllocationsMessage.replace("{1}", dtEnd.toLocaleDateString(navigator.language, {
                            day: 'numeric', month: 'numeric', year: 'numeric'
                        }));

                    }
                    else if (resp.length === 1) {
                        this.openAllocations = true;
                        let dtBegin = new Date(resp[0].dt_Confirmed);
                        this.openAllocationsMessage = this.translate.instant("SingleOpenAllocationMessage");
                        this.openAllocationsMessage = this.openAllocationsMessage.replace("{0}", dtBegin.toLocaleDateString(navigator.language, {
                            day: 'numeric', month: 'numeric', year: 'numeric'
                        }));
                    }
                }
            });
    }
    selectRow(row) {
        this.activeRow = row;
        window.scrollBy({
            top: 0, // could be negative value
            left: 0,
            behavior: 'smooth'
        });
    }

    fetchSavedCollects() {
        return this.apiService.getData("Collects/Collect")
            .then(resp => {
                if (resp === undefined) {
                    this.savedCollects = [];
                    return;
                }
                this.savedCollects = resp;
                for (let i in this.savedCollects) {
                    this.savedCollects[i].BeginDate = new Date(resp[i].BeginDate);
                    this.savedCollects[i].EndDate = new Date(resp[i].EndDate);

                    let start = this.savedCollects[i].BeginDate;
                    let end = this.savedCollects[i].EndDate;
                    this.savedCollects[i].BeginDateString = start.toLocaleDateString(navigator.language, { day: "numeric", year: 'numeric', month: 'long' }) + " " + this.datePipe.transform(start, 'shortTime');
                    this.savedCollects[i].EndDateString = end.toLocaleDateString(navigator.language, { day: "numeric", year: 'numeric', month: 'long' }) + " " + this.datePipe.transform(end, 'shortTime');
                    if (this.savedCollects[i].CollectId) {
                        this.savedCollects[i].MultipleCollects = true;
                    } else {
                        this.savedCollects[i].MultipleCollects = false;
                    }
                }

            })
    }

    selectCollect(collect: Collection) {
        this.inputTitleLength = collect.Name.length - 2;
        this.SearchButtonGreen = false;

        this.collectId = null;
        this.dateBegin = collect.BeginDate;
        this.dateEnd = collect.EndDate;
        this.multipleCollects = collect.MultipleCollects;
        this.multipleCollectsId = collect.CollectId;
        this.filterCollect(this.multipleCollectsId);
        this.collectId = collect.Id;
        this.collectName = collect.Name;
        window.scrollTo(0, 0);

    }

    saveCollect() {
        this.SearchButtonGreen = false;
        let newCollect = new Collection();
        newCollect.BeginDate = this.dateBegin;
        newCollect.EndDate = this.dateEnd;
        newCollect.Name = this.collectName;
        if (this.multipleCollects) {
            newCollect.CollectId = this.multipleCollectsId;
        }
        this.apiService.postData("Collects/Collect", newCollect)
            .then(resp => {
                this.fetchSavedCollects().then(() => {
                    this.collectId = this.savedCollects[this.savedCollects.length - 1].Id;
                });

            })
            .catch(err => console.log(err));
        setTimeout(this.fetchSavedCollects(), 1000);
    }

    deleteCollect(id: number) {
        this.SearchButtonGreen = false;
        if (id == undefined) return;
        this.apiService.delete("Collects/Collect/" + id)
            .then(resp => {
                this.isVisible = false;
                this.fetchSavedCollects();
                this.collectId = null;
            })
            .catch(err => console.log(err));
    }

    fetchCollect() {
        this.dataService.writeData("collectDateBegin", Math.round(this.dateBegin.getTime() / 1000));
        this.dataService.writeData("collectDateEnd", Math.round(this.dateEnd.getTime() / 1000));
        this.showCosts = false;
        if (this.dateBegin !== null && this.dateEnd !== null) {
            var dateBegin = this.datePipe.toISODateUTC(this.dateBegin);
            var dateEnd = this.datePipe.toISODateUTC(this.dateEnd);
            let params;
            if (this.multipleCollects) {
                params = "DateBegin=" + dateBegin + "&DateEnd=" + dateEnd + "&CollectId=" + this.multipleCollectsId;
            } else {
                params = "DateBegin=" + dateBegin + "&DateEnd=" + dateEnd + "&Status=2";
            }
            //.toLocaleDateString(navigator.language, { year: 'numeric', month: 'long'});
            let beginTime = new Date(this.dateBegin.valueOf()).getTime();
            let endTime = new Date(this.dateEnd.valueOf()).getTime();
            this.sameDate = (new Date(this.dateBeginRange).getDate() === new Date(this.dateEndRange).getDate());
            this.dateBeginRange = new Object();
            this.dateEndRange = new Object();
            this.dateBeginRange.string = this.dateBegin.toLocaleDateString(navigator.language, { day: 'numeric', month: 'long', year: 'numeric' }) + " " + this.datePipe.transform(beginTime, 'shortTime');
            this.dateEndRange.string = this.dateEnd.toLocaleDateString(navigator.language, { day: 'numeric', month: 'long', year: 'numeric' }) + " " + this.datePipe.transform(endTime, 'shortTime');
            this.isVisible = true;
        }

    }

    displayValue(x) {
        let currencySymbol = this.userService.currencySymbol;
        if (!navigator.language.includes('en'))
            currencySymbol += " ";
        return currencySymbol + (this.isSafari ? parseFloat(x).toFixed(2) : (x).toLocaleString(navigator.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }

    onDateBeginChange(date) {
        if (this.dateEnd && this.dateEnd.getTime() <= this.dateBegin.getTime()) {
            this.dateEnd = new Date(this.dateBegin.getTime() + 0.5 * 60 * 60 * 1000);
        } else if (!this.dateEnd) {
            this.dateEnd = new Date(this.dateBegin.getTime() + 0.5 * 60 * 60 * 1000);
        }
    }

    onDateEndChange(date) {
        if (this.dateBegin && this.dateEnd.getTime() <= this.dateBegin.getTime()) {
            this.dateBegin = new Date(this.dateEnd.getTime() - 0.5 * 60 * 60 * 1000);
        } else if (!this.dateBegin) {
            this.dateBegin = new Date(this.dateEnd.getTime() - 0.5 * 60 * 60 * 1000);
        }
    }

    filterCollect(collectId) {
        if (collectId == null || collectId == 0) {
            this.multipleCollects = false;
        } else {
            this.multipleCollects = true;
            this.multipleCollectsId = collectId;
        }
        this.fetchAllGivts();
        this.fetchCollect();
    }

    fetchAllGivts() {
        this.totalAmountsCombined = 0;
        if (this.dateBegin !== null && this.dateEnd !== null) {
            let baseParams;
            if (this.multipleCollects) {
                baseParams = "&CollectId=" + this.multipleCollectsId;
            } else {
                baseParams = "";
            }


            if (this.userService.CurrentCollectGroup) {
                this.apiService.getData("v2/collectgroups/" + this.userService.CurrentCollectGroup.GUID
                    + "/givts/view/search?dtBegin=" + this.datePipe.toISODateUTC(this.dateBegin) + "&dtEnd=" + this.datePipe.toISODateUTC(this.dateEnd)
                    + baseParams)
                    .then(serverResp => {
                        let resp = serverResp.reduce(function (rv, x) {
                            let el = rv.find(r => r && r.key === x.Status);
                            if (el)
                                el.values.push(x);
                            else
                                rv.push({ key: x.Status, values: [x] });
                            return rv;
                        }, []);

                        //reset vars
                        this.infoToProcess = new visualCollection(0, 0);
                        this.infoProcessed = new visualCollection(0, 0);
                        this.infoCancelledByUser = new visualCollection(0, 0);
                        this.infoCancelledByBank = new visualCollection(0, 0);
                        this.pieChartData = [0, 0, 0, 0];
                        this.totalAmountsCombined = 0;

                        for (let i = 0; i < resp.length; i++) {
                            let currentResp = resp[i];
                            let count = currentResp.values.reduce(function (rv, x) {
                                rv += x.Count; return rv;
                            }, 0);
                            let sum = currentResp.values.reduce(function (rv, x) {
                                rv += x.Sum; return rv;
                            }, 0);
                            switch (currentResp.key) {
                                case 1:
                                case 2:
                                    this.infoToProcess.numberOfUsers += count;
                                    this.infoToProcess.totalAmount += sum;
                                    break;
                                case 3:
                                    this.infoProcessed.numberOfUsers += count;
                                    this.infoProcessed.totalAmount += sum;
                                    break;
                                case 4:
                                    this.infoCancelledByBank.numberOfUsers += count;
                                    this.infoCancelledByBank.totalAmount += sum;
                                    break;
                                case 5:
                                    this.infoCancelledByUser.numberOfUsers += count;
                                    this.infoCancelledByUser.totalAmount += sum;
                                    break;
                                default:
                                    break;
                            }
                        }
                        this.pieChartLabels = [this.translate.instant("Processing").toString(), this.translate.instant("Processed"), this.translate.instant("CancelledByBank"), this.translate.instant("CancelledByUser")];
                        this.pieChartData = [this.infoToProcess.totalAmount, this.infoProcessed.totalAmount, this.infoCancelledByBank.totalAmount, this.infoCancelledByUser.totalAmount];
                        this.totalAmountsCombined = this.infoToProcess.totalAmount + this.infoProcessed.totalAmount + this.infoCancelledByBank.totalAmount + this.infoCancelledByUser.totalAmount;

                        //open the graph details when amount is available
                        if (this.totalAmountsCombined > 0) {
                            this.showCosts = true;
                        }
                        this.isDataAvailable = true;
                        if (this.chart != undefined) {
                            this.chart.chart.update();
                        }
                    });
            }
            this.isVisible = true;
        }
    }
}
