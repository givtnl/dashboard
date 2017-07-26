/**
 * Created by bjorn_ss08m1t on 3/6/2017.
 */
export class Payout{
    dtExecuted: Date;
    BeginDate: string;
    EndDate: string;
    TransactionCount: number;
    TotalPaid: string;
    MandateCostCount: number;

    GivtServiceFee: string;
    TotalPaidText: string;

    Mandaatkosten: any;
    Transactiekosten: any;
    Uitbetalingskosten: any;
    T_Total_Excl: any;
    T_BTW: any;
    MandateTaxes: any;
    TransactionTaxes: any;
    PayoutCostTaxes: any;
    T_Total_Incl: any;
    StorneringsKostenT1: any;
    RTransactionT1Cost: any;
    RTransactionT1Count: any;
    RTransactionT1Amount: any;
    RTransactionT2Count: any;
    RTransactionT2Amount: any;
    StorneringsKostenT2: any;
    RTransactionT2Cost: any;
    SK_Total_Excl: any;
    RTransactionTaxes: any;
    SK_BTW: string;
    SK_Total_Incl: any;
    GivtServiceFeeTaxes: any;
    G_Total_Incl: any;
    G_Total_Excl: any;
    G_BTW: any;
    RTransactionAmount: any;
    GestorneerdeBedragen: any;
    TotaalInhoudingen: any;
    ToegezegdBedrag: any;
    hidden: boolean;
    Text_Info_Mandate: string;
    Text_Info_Transaction: string;
    Text_Info_Type1: string;
    Text_Info_Type2: string;
    activeRow: number;
}

export let testData: any = [
  {
    "Id":0,
    "OrgId":"1c917e4c-0516-4f5c-86fe-092c95018765",
    "dtExecuted":"2017-04-03T15:38:28.363",
    "BeginDate":"2017-04-03T00:00:00",
    "EndDate":"2017-04-09T00:00:00",
    "TransactionCount":50,
    "TransactionCost":4.0,
    "TransactionTaxes":0.84,
    "MandateCostCount":0,
    "MandateCost":0.0,
    "MandateTaxes":0.0,
    "RTransactionT1Count":0,
    "RTransactionT1Cost":0.0,
    "RTransactionT2Count":0,
    "RTransactionT2Cost":0.0,
    "RTransactionAmount":0.0,
    "RTransactionTaxes":0.0,
    "GivtServiceFee":14.22,
    "GivtServiceFeeTaxes":2.9862,
    "PayoutCost":0.18,
    "PayoutCostTaxes":0.0378,
    "TotalPaid":293.736
  },
  {
    "Id":0,
    "OrgId":"1c917e4c-0516-4f5c-86fe-092c95018765",
    "dtExecuted":"2017-04-03T15:38:28.363",
    "BeginDate":"2017-04-03T00:00:00",
    "EndDate":"2017-04-09T00:00:00",
    "TransactionCount":50,
    "TransactionCost":4.0,
    "TransactionTaxes":0.84,
    "MandateCostCount":0,
    "MandateCost":0.0,
    "MandateTaxes":0.0,
    "RTransactionT1Count":0,
    "RTransactionT1Cost":0.0,
    "RTransactionT2Count":0,
    "RTransactionT2Cost":0.0,
    "RTransactionAmount":0.0,
    "RTransactionTaxes":0.0,
    "GivtServiceFee":14.22,
    "GivtServiceFeeTaxes":2.9862,
    "PayoutCost":0.18,
    "PayoutCostTaxes":0.0378,
    "TotalPaid":293.736
  }
];

