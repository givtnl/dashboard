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