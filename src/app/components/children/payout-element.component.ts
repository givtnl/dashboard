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
  showCosts: boolean = false;
  pledgedAmount: number;


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

    this.pledgedAmount = x.ToegezegdBedrag;

    x.Mandaatkosten = this.displayValue(x.Mandaatkosten);
    x.Transactiekosten = this.displayValue(x.Transactiekosten);
    x.UitbetalingskostenIncl = this.displayValue(x.Uitbetalingskosten * 1.21);
    x.UitbetalingskostenFormatted = this.displayValue(x.Uitbetalingskosten);
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
      this.apiClient.getData('Payments/PayoutDetail?payoutID='+this.childData.Id)
        .then( (resp) => {
          let allocsCount: number = resp.Details.length;
          for(let i = 0; i < allocsCount; i++){
            resp.Details[i].Status = 1;
            if(resp.Details[i].Amount !== 0)
              resp.Details[i].Amount = this.displayValue(resp.Details[i].Amount);
            if(resp.Details[i].Name.includes("_ERRNAC")){
              if(resp.Details[i].Name.includes("1"))
                resp.Details[i].Name = res + " 1";
              if(resp.Details[i].Name.includes("2"))
                resp.Details[i].Name = res + " 2";
              if(resp.Details[i].Name.includes("3"))
                resp.Details[i].Name = res + " 3";
              resp.Details[i].Status = 2;
            }
          }

          this.translate.get('Stornos').subscribe((res: string) => {
            for(let i = 0; i < allocsCount; i++){
              if(resp.Details[i].StornoAmount == 0)
                continue;
              let copy = JSON.parse(JSON.stringify(resp.Details[i])); //copy object
              copy.Name += ": " + res;
              copy.Amount = "- " +  this.displayValue(resp.Details[i].StornoAmount);
              copy.Status = 0;
              resp.Details.push(copy);
            }

          resp.Details.sort((a, b) => a.Name.localeCompare(b.Name)); //sort by name A-Z
          this.childData.details = resp.Details;

          this.childData.KostOverToewijzingenIncl = this.displayValue(resp.Costs + (this.childData.Uitbetalingskosten * 1.21))
          });
        });
    });
  }

  exportCSV(){

    let data = [["Total paid", "Pledged", "Costs", "VAT", "Storno"], [this.childData.TotalPaid, this.pledgedAmount,this.childData.MandateCost + this.childData.PayoutCost + this.childData.TransactionCost + this.childData.RTransactionT1Cost + this.childData.RTransactionT2Cost + this.childData.GivtServiceFee,this.childData.MandateTaxes + this.childData.PayoutCostTaxes + this.childData.TransactionTaxes + this.childData.GivtServiceFeeTaxes + this.childData.RTransactionTaxes, this.childData.RTransactionAmount]];
    console.log(data);
    var csvContent = "data:text/csv;charset=utf-8,";
    data.forEach((infoArray, index) => {
      let dataString = infoArray.join(",");
      csvContent += index < data.length ? dataString+ "\n" : dataString;
    });
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    let fileName = this.childData.BeginDate + "-" + this.childData.EndDate + ".csv";
    link.setAttribute("download", fileName);
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "my_data.csv".
    console.log("download click");
  }
}
