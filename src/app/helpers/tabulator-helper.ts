import { Injectable } from "@angular/core";
import { TabulatorRowGivt } from "app/models/TabulatorRowGivt";
import { isNullOrUndefined, isString } from "util";
import * as moment from "moment"
import * as TabulatorTypes from "tabulator-tables"

@Injectable()
export class TabulatorHelper {
    public _tabulatorRows: TabulatorRowGivt[]

    setField(input: any, success: any, cell: any): void {
        let date = new Date(input.value)
        if (moment.isDate(new Date(input.value))) {
            success(date.toLocaleString(navigator.language,
                {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }));
            this.setTabulatorRowGivt(cell.getRow())
        }
    }
    isValidValue(object: TabulatorTypes.Tabulator.CellComponent, typeke: InputType): boolean {
        var retVal = false; let value = object.getValue()
        switch (typeke) {
            case InputType.DateTime: {
                retVal = new Date(moment(value).format("YYYY-MM-DDTHH:mm")).toString() != "Invalid Date"
                break
            }
            case InputType.Number: {
                retVal = !isNaN(value) && value >= 1 && value <= 3 // only collect 1 - 2 - 3
                break
            }
            case InputType.String: {
                retVal = isString(value) && value.length > 1 && value.length < 36 // 
            }
        }
        return retVal
    }
    setTabulatorRowGivt(row: TabulatorTypes.Tabulator.RowComponent) {
        console.log("Setting tabulator row...")
        var tableRow = this._tabulatorRows[row.getPosition()]
        var cells: TabulatorTypes.Tabulator.CellComponent[] = row.getCells()
        cells.forEach((cell: TabulatorTypes.Tabulator.CellComponent, index: number) => {
            if (!isNullOrUndefined(cell)) {
                if (index == 0 && this.isValidValue(cell, InputType.DateTime)) {
                    tableRow.startDate = new Date(moment(cell.getValue()).format("YYYY-MM-DDTHH:mm"))
                } else if (index == 1 && this.isValidValue(cell, InputType.DateTime)) {
                    tableRow.endDate = new Date(moment(cell.getValue()).format("YYYY-MM-DDTHH:mm"))
                } else if (index == 2 && this.isValidValue(cell, InputType.String)) {
                    var val = String(cell.getValue());
                    tableRow.collectName = String(cell.getValue())
                } else if (index == 3 && this.isValidValue(cell, InputType.Number)) {
                    tableRow.collectNumber = Number(cell.getValue())
                }
            }
        })
        this._tabulatorRows[row.getPosition()] = tableRow
    }
}

enum InputType {
    DateTime,
    String,
    Number
}