export class UpdateAllocationCommand {
    id: number;
    name:string;
    dtBegin: Date;
    dtEnd: Date;
    collectId: number;
    accountId: number | null;
}
