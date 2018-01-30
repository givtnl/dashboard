import {Component, OnInit, Attribute, ViewEncapsulation, ViewChild} from '@angular/core';
import { DatePipe } from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
//import { BrowserAnimationsModule } from '@angular/animations';
import { ApiClientService } from "app/services/api-client.service";
import {TranslatePipe, TranslateService} from "ng2-translate";
import {CalendarModule} from "primeng/primeng";
import {Collection} from "../models/collection";
import {DataService} from "../services/data.service";
import {UserService} from "../services/user.service";
import {visualCollection} from "../models/visualCollection";
import {BaseChartDirective} from "ng2-charts";
import * as moment from "moment";
import Base = moment.unitOfTime.Base;
import {forEach} from "@angular/router/src/utils/collection";
@Component({
    selector: 'my-collects',
    templateUrl: '../html/collects.component.html',
    styleUrls: ['../css/collects.component.css'],
    encapsulation: ViewEncapsulation.None
})

export class CollectsComponent implements OnInit{
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
    dateBeginTime : number;
    maxDate: Date;
    isVisible: boolean= false;
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

    en: any = {
        firstDayOfWeek: 0,
        dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        dayNamesMin: ["Su","Mo","Tu","We","Th","Fr","Sa"],
        monthNames: [ "January","February","March","April","May","June","July","August","September","October","November","December" ],
        monthNamesShort: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
    };
    nl: any = {
        firstDayOfWeek: 1,
        closeText: 'Sluiten',
        prevText: 'Terug',
        nextText: 'Volgende',
        currentText: 'Huidig',
        monthNames: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December' ],
        monthNamesShort: ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec' ],
        dayNames: ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'],
        dayNamesShort: ['zo', 'ma', 'di', 'woe', 'do', 'vr', 'za'],
        dayNamesMin: ['Zo', 'Ma', 'Di', 'Wo ', 'Do', 'Vr ', 'Za'],
        weekHeader: 'Week',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix:'',
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
    };
    locale: any;

    dateRange: Date;
    timeRange: string;

    inputTitleLength: number = 1;
    openAllocations: boolean = false;

    public pieChartLabels:string[] = [this.translate.instant("Text_Export").toString(), 'Verwerkt', 'Geweigerd',"Geannuleerd"];
    public pieChartData:number[] = [0,0,0,0];
    public pieChartType:string = 'pie';
    public chartColors: any[] = [
      {
        backgroundColor:["#494874", "#41C98E", "#D43D4C", "#9B96B0"]
      }];
    selectedIndex: number = -1;
    public pieChartOptions: any = {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      borderWidth : 0,
      tooltips: {
        filter: function(tooltipItem, data) {
          return data.datasets[0].data[tooltipItem.index] != 0;
        },
        bodyFontColor: 'rgb(44,43,87)',
        backgroundColor: 'rgb(255,255,255)',
        callbacks: {
          label: function(tooltipItem, data) {
            let val = data.datasets[0].data[tooltipItem.index];
            let label = data.labels[tooltipItem.index];
            let amount = this.displayValue(val);
            return label + ": " + amount;
          }.bind(this)
        }
      },
      hover: {
        onHover: (event, active) => {
          if(active && active.length){
            let index = active[0]._index; //with this you get the index of the segment you hovered on
            this.selectedIndex = index;
            //console.log(active[0]._chart.config.data.labels);  //with this you can get all the labels of your chart
            //console.log(active[0]._chart.config.data.datasets[0].backgroundColor);   //with this you can get all the bg color of your chart
            //console.log(active[0]._chart.config.data.datasets[0].data);   //with this you can get all the dataset values of your chart
            this.chartHovered(event);
          }
        }
      }
    };
    public chartClicked(e:any):void {
      //console.log(e);
    }

    public chartHovered(e:any):void {
      //console.log(e);
    }

    public resetInfoButtonsPopovers() {
      this.infoButtonShouldHavePopover = [false, false, false, false];
    }


    ngOnInit(){
      this.checkAllocations();
      this.fetchSavedCollects();
    }

    constructor(private apiService: ApiClientService, private translate: TranslateService, private datePipe: DatePipe, private dataService: DataService, private userService: UserService) {
        this.locale = this.nl;

        this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        switch (this.translate.currentLang){
            case "nl":
                this.locale = this.nl;
                break;
            case "en":
                this.locale = this.en;
                break;
            default:
                this.locale = this.nl;
                break;
        }
        this.apiService = apiService;
        this.text = "dit zijn de collectes";
        this.calendarModule = new CalendarModule();
        this.dateBeginTime = 5000;
        this.maxDate = new Date();
        this.dateBegin = new Date();
        this.dateEnd = new Date();
        this.dateBegin.setHours(6,0,0);

        if (!!this.dataService.getData('dateBegin') && !!this.dataService.getData('dateEnd')) {
          let b = new Date(1970, 0, 1);
          let e = new Date(1970, 0, 1);
          this.dateBegin = new Date(b.setSeconds(Number(this.dataService.getData('dateBegin'))));
          this.dateEnd = new Date(e.setSeconds(Number(this.dataService.getData('dateEnd'))));
        }

        this.userService.collectGroupChanged.subscribe(() => {
            this.ngOnInit();
        });
    }

  checkAllocations(){
    let apiUrl = 'Allocations/AllocationCheck';
    this.apiService.getData(apiUrl)
      .then(resp => {
        if(resp.length > 0){
          this.openAllocations = true;
        }
      });
  }

    selectRow(row){
        this.activeRow = row;
    }

    fetchSavedCollects(){
        return this.apiService.getData("Collects/Collect")
            .then(resp => {
                if(resp == undefined){
                    this.savedCollects = [];
                    return;
                }
                this.savedCollects = resp;
                for(let i in this.savedCollects){
                    this.savedCollects[i].BeginDate = new Date(resp[i].BeginDate + "Z");
                    this.savedCollects[i].EndDate =  new Date(resp[i].EndDate + "Z");

                    this.savedCollects[i].BeginDateString = this.datePipe.transform(this.savedCollects[i].BeginDate, 'd MMMM y');
                    this.savedCollects[i].EndDateString = this.datePipe.transform(this.savedCollects[i].EndDate, 'd MMMM y');
                    this.savedCollects[i].BeginTimeString = this.datePipe.transform(this.savedCollects[i].BeginDate, 'shortTime');
                    this.savedCollects[i].EndTimeString = this.datePipe.transform(this.savedCollects[i].EndDate, 'shortTime');
                    if(this.savedCollects[i].CollectId) {
                        this.savedCollects[i].MultipleCollects = true;
                    } else {
                        this.savedCollects[i].MultipleCollects = false;
                    }
                }

            })
    }

    selectCollect(collect: Collection){
        this.inputTitleLength = collect.Name.length-2;
        this.SearchButtonGreen = false;

        this.collectId = null;
        this.dateBegin = collect.BeginDate;
        this.dateEnd  = collect.EndDate;
        this.multipleCollects = collect.MultipleCollects;
        this.multipleCollectsId = collect.CollectId;
        this.filterCollect(this.multipleCollectsId);
        this.collectId = collect.Id;
        this.collectName = collect.Name;
        window.scrollTo(0,0);

    }

    saveCollect(){
        this.SearchButtonGreen = false;
        let newCollect = new Collection();
        newCollect.BeginDate = this.dateBegin;
        newCollect.EndDate = this.dateEnd;
        newCollect.Name = this.collectName;
        if(this.multipleCollects)
        {
            newCollect.CollectId = this.multipleCollectsId;
        }
        this.apiService.postData("Collects/Collect", newCollect)
            .then(resp => {
                this.fetchSavedCollects().then(() => {
                    this.collectId = this.savedCollects[this.savedCollects.length-1].Id;
                });

            })
            .catch(err => console.log(err));
        setTimeout(this.fetchSavedCollects(), 1000);
    }

    deleteCollect(id: number){
        this.SearchButtonGreen = false;
        if(id == undefined) return;
        this.apiService.delete("Collects/Collect/" + id)
            .then(resp => {
                this.isVisible = false;
                this.fetchSavedCollects();
                this.collectId = null;
            })
            .catch(err => console.log(err));
    }

    fetchCollect() {
      this.dataService.writeData("dateBegin", Math.round(this.dateBegin.getTime() / 1000).toString());
      this.dataService.writeData("dateEnd", Math.round(this.dateEnd.getTime() / 1000).toString());
        this.ShowLoadingAnimation = true;
        this.showCosts = false;
        if(this.dateBegin !== null && this.dateEnd !== null){
            var dateBegin = this.formatDate(this.dateBegin);
            var dateEnd = this.formatDate(this.dateEnd);
            let params;
            if(this.multipleCollects){
                params = "DateBegin=" + dateBegin + "&DateEnd=" + dateEnd + "&CollectId=" + this.multipleCollectsId;
            }else{
                params = "DateBegin=" + dateBegin + "&DateEnd=" + dateEnd + "&Status=2";
            }

            let beginTime = new Date(this.dateBegin.valueOf()).getTime();
            let endTime = new Date(this.dateEnd.valueOf()).getTime();
            this.sameDate = ( new Date(this.dateBeginRange).getDate() ===  new Date(this.dateEndRange).getDate());
            this.dateBeginRange = new Object();
            this.dateEndRange = new Object();
            this.dateBeginRange.string = this.datePipe.transform(this.dateBegin, 'd MMMM y');
            this.dateEndRange.string = this.datePipe.transform(this.dateEnd, 'd MMMM y');
            this.dateBeginRange.time = this.datePipe.transform(beginTime, 'shortTime');
            this.dateEndRange.time = this.datePipe.transform(endTime,'shortTime');

            this.isVisible = true;

            let euro =  "€";
            if(!navigator.language.includes('en'))
                euro += " ";

            this.apiService.getData("Cards/Givts/?"+params)
                .then(resp =>
                {
                  this.ShowLoadingAnimation = false;
                });
        }

    }

    displayValue(x)
    {
        let euro =  "€";
        if(!navigator.language.includes('en'))
            euro += " ";
        return euro + (this.isSafari ? parseFloat(x).toFixed(2) : (x).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}));
    }

    onDateBeginChange(date){
        if(this.dateEnd && this.dateEnd.getTime() <= this.dateBegin.getTime()){
            this.dateEnd = new Date(this.dateBegin.getTime() + 0.5*60*60*1000);
        }else if(!this.dateEnd){
            this.dateEnd = new Date(this.dateBegin.getTime() + 0.5*60*60*1000);
        }
    }

    onDateEndChange(date){
        if(this.dateBegin && this.dateEnd.getTime() <= this.dateBegin.getTime()){
            this.dateBegin = new Date(this.dateEnd.getTime() - 0.5*60*60*1000);
        }else if(!this.dateBegin) {
            this.dateBegin = new Date(this.dateEnd.getTime() - 0.5*60*60*1000);
        }
    }

    formatDate(d){
        d = new Date(d);
        return [d.getUTCMonth()+1,
            d.getUTCDate(),
            d.getUTCFullYear()].join('/')+' '+
        [d.getUTCHours(),
            d.getUTCMinutes()].join(':');
    }

    filterCollect(collectId){
       if(collectId == null || collectId == 0){
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
      if(this.dateBegin !== null && this.dateEnd !== null){
        var dateBegin = this.formatDate(this.dateBegin);
        var dateEnd = this.formatDate(this.dateEnd);
        let baseParams;
        if(this.multipleCollects){
          baseParams = "&CollectId=" + this.multipleCollectsId;
        }else{
          baseParams = "";
        }


        if (this.dataService.getData("CurrentCollectGroup")) {
          let GUID = JSON.parse(this.dataService.getData("CurrentCollectGroup")).GUID;
          this.apiService.getData("v2/collectgroups/" + GUID + "/givts/view/search?dtBegin=" + dateBegin + "&dtEnd=" + dateEnd + baseParams)
            .then(resp =>
            {
              //reset vars
              this.infoToProcess = new visualCollection(0,0);
              this.infoProcessed = new visualCollection(0,0);
              this.infoCancelledByUser = new visualCollection(0,0);
              this.infoCancelledByBank = new visualCollection(0,0);
              this.pieChartData = [0,0,0,0];
              this.totalAmountsCombined = 0;

              for(let i = 0; i < resp.length; i++) {
                let currentResp = resp[i];
                switch (resp[i].Status) {
                  case 1:
                  case 2:
                    this.infoToProcess.numberOfUsers += currentResp.Count;
                    this.infoToProcess.totalAmount += currentResp.Sum;
                    break;
                  case 3:
                    this.infoProcessed.numberOfUsers += currentResp.Count;
                    this.infoProcessed.totalAmount += currentResp.Sum;
                    break;
                  case 4:
                    this.infoCancelledByBank.numberOfUsers += currentResp.Count;
                    this.infoCancelledByBank.totalAmount += currentResp.Sum;
                    break;
                  case 5:
                    this.infoCancelledByUser.numberOfUsers += currentResp.Count;
                    this.infoCancelledByUser.totalAmount += currentResp.Sum;
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
              if(this.chart != undefined) {
                this.chart.chart.update();
              }
            });
        }


        this.isVisible = true;

      }
    }



}
