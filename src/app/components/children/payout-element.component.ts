import {Component, Input, OnInit} from '@angular/core';
import {ApiClientService} from "../../services/api-client.service";
import {DatePipe} from "@angular/common";
import {TranslateService} from "ng2-translate";
import {ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'payout',
  templateUrl: '../../html/children/payout.html',
  encapsulation: ViewEncapsulation.None

})

export class PayoutComponent implements OnInit{
  ngOnInit(): void {
    console.log(this.childData);
    this.doSomeFancyStuff();
  }

  displayValue(x)
  {
    let euro =  "€";
    if(!navigator.language.includes('en'))
      euro += " ";
    return euro + (this.isSafari ? (x).toFixed(2) : (x).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}));
  }

  isSafari: boolean;
  @Input() childData: any;
  name: string = "";
  transactionCost = 0.08;
  mandateCost = 0.125;
  constructor(private apiClient: ApiClientService,private translate: TranslateService, private datePipe: DatePipe) {
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.name = "Testen";

  }

  doSomeFancyStuff(){
    let x = this.childData;
    x.BeginDate = this.datePipe.transform(new Date(this.childData.BeginDate), "d MMMM y");
    x.EndDate = this.datePipe.transform(new Date(this.childData.EndDate), "d MMMM y");

    x.Mandaatkosten = x.MandateCostCount * this.mandateCost;
    x.Transactiekosten = x.TransactionCount * this.transactionCost;
    x.Uitbetalingskosten = 0.18;
    x.T_Total_Excl = x.Mandaatkosten + x.Transactiekosten + x.Uitbetalingskosten;
    x.T_BTW = x.MandateTaxes + x.TransactionTaxes + x.PayoutCostTaxes;
    x.T_Total_Incl = x.T_Total_Excl + x.T_BTW;

    x.SK_Total_Incl = x.RTransactionT1Cost + x.RTransactionT2Cost + x.RTransactionTaxes;
    x.G_Total_Incl = x.GivtServiceFee + x.GivtServiceFeeTaxes;

    //tr fee + storno fee + givt fee + storno bedragen
    x.TotaalInhoudingen = x.T_Total_Incl + x.SK_Total_Incl + x.G_Total_Incl + x.RTransactionAmount;

    x.ToegezegdBedrag = x.TotaalInhoudingen + x.TotalPaid;

    x.Mandaatkosten = this.displayValue(x.Mandaatkosten);
    x.Transactiekosten = this.displayValue(x.Transactiekosten);
    x.Uitbetalingskosten = this.displayValue(x.Uitbetalingskosten);
    x.T_Total_Excl = this.displayValue(x.T_Total_Excl);
    x.T_BTW = this.displayValue(x.T_BTW);
    x.T_Total_Incl = this.displayValue(x.T_Total_Incl);

    x.StorneringsKostenT1 = this.displayValue(x.RTransactionT1Cost);
    x.StorneringsKostenT2 = this.displayValue(x.RTransactionT2Cost);
    x.SK_Total_Excl = this.displayValue(x.RTransactionT1Cost + x.RTransactionT2Cost);
    x.SK_BTW = this.displayValue(x.RTransactionTaxes);
    x.SK_Total_Incl = this.displayValue(x.SK_Total_Incl);

    x.G_Total_Excl = this.displayValue(x.GivtServiceFee);
    x.G_BTW = this.displayValue(x.GivtServiceFeeTaxes);
    x.G_Total_Incl = this.displayValue(x.G_Total_Incl);

    x.GestorneerdeBedragen = this.displayValue(x.RTransactionAmount);
    x.TotaalInhoudingen = this.displayValue(x.TotaalInhoudingen);
    x.ToegezegdBedrag = this.displayValue(x.ToegezegdBedrag);


    x.hiddenOverview = true;
    x.hiddenAllocations = true;
    x.TotalPaidText = this.displayValue(x.TotalPaid);

    this.translate.get('Text_Info_Mandate', {0: x.MandateCostCount,1: (this.isSafari ? (this.mandateCost).toFixed(3) : (this.mandateCost).toLocaleString(navigator.language,{minimumFractionDigits: 3,maximumFractionDigits:3}))}).subscribe((res: string) => {
      x.Text_Info_Mandate = res;
    });

    this.translate.get('Text_Info_Transaction', {0: x.TransactionCount,1: (this.isSafari ? (this.transactionCost).toFixed(2) : (this.transactionCost).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}))}).subscribe((res: string) => {
      x.Text_Info_Transaction = res;
    });

    this.translate.get('Text_Info_Type1', {0: x.RTransactionT1Count,1: (this.isSafari ? (0.18).toFixed(2) : (0.18).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}))}).subscribe((res: string) => {
      x.Text_Info_Type1 = res;
    });

    this.translate.get('Text_Info_Type2', {0: x.RTransactionT2Count,1: (this.isSafari ? (1.20).toFixed(2) : (1.20).toLocaleString(navigator.language,{minimumFractionDigits: 2,maximumFractionDigits:2}))}).subscribe((res: string) => {
      x.Text_Info_Type2 = res;
    });

    x.activeRow = 1;
  }

  openPayout(){
    this.childData.hiddenAllocations = true;
    this.childData.hiddenOverview = !this.childData.hiddenOverview;
  }

  openAllocations(){
    this.fetchPayoutDetail();
    this.childData.hiddenOverview = true;
    this.childData.hiddenAllocations = !this.childData.hiddenAllocations;
  }


  closeOverview(){
    this.childData.hiddenOverview = true;
  }

  closeAllocations(){
    this.childData.hiddenAllocations = true;
  }

  selectRow(x, y)
  {
    x.activeRow = y;
  }

  fetchPayoutDetail(){
    this.translate.get('NonAllocatedCollect').subscribe((res: string) => {
      this.apiClient.getData('OrgAdminView/PayoutDetail?payoutID='+this.childData.Id)
          .then( (resp) => {
            console.log(resp);
            for(var i = 0; i < resp.length; i++){
              resp[i].Status = 1;
              resp[i].Amount = this.displayValue(resp[i].Amount);
              if(resp[i].Name == null){
                resp[i].Name = res;
                resp[i].Status = 0;
              }
            }
            this.childData.details = resp;
          });
    });
  }
}