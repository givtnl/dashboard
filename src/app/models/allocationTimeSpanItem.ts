export class AllocationTimeSpanItem
{
    dtStart : Date;
    dtEnd : Date;
    transactions : Array<Transaction>;
}

export class Transaction
{
    TimeStamp : Date;
    Amount : number;
    CollectId : string;
}