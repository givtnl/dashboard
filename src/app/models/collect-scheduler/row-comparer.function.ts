export function compareRows(oldValue: any, newValue: any) {
    var oldVal: any = {
        dtBegin: oldValue.dtBegin,
        dtEnd: oldValue.dtEnd,
        name: oldValue.name,
        collectId: oldValue.collectId
    };
    var newVal: any = {
        dtBegin: newValue.dtBegin,
        dtEnd: newValue.dtEnd,
        name: newValue.name,
        collectId: newValue.collectId
    }
    return JSON.stringify(oldVal) === JSON.stringify(newVal)
}