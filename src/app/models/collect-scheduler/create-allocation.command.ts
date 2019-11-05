export class CreateAllocationCommand {
    name:string;
    dtBegin: Date;
    dtEnd: Date;
    collectId: number;
    accountId: number | null;
}
