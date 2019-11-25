export function compareRows(oldValue: any, newValue: any) {
    var oldVal: any = {
        dtBegin: oldValue.dtBegin,
        dtEnd: oldValue.dtEnd,
        name: oldValue.name,
        collectId: oldValue.collectId,
        accountId: oldValue.accountId
    };
    var newVal: any = {
        dtBegin: newValue.dtBegin,
        dtEnd: newValue.dtEnd,
        name: newValue.name,
        collectId: newValue.collectId,
        accountId: newValue.accountId
    }
    return JSON.stringify(oldVal) === JSON.stringify(newVal)
}
