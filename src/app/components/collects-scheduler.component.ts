import { Component, OnInit } from '@angular/core';
import * as TabulatorTypes from "tabulator-tables"
import * as TabulatorTable from "./../../../node_modules/tabulator-tables"


import * as moment from 'moment'

@Component({
  selector: 'app-csveditor',
  templateUrl: '../html/collects-scheduler.component.html',
  styleUrls: ['../css/collects-scheduler.component.css']
})

export class CollectsShedulerComponent implements OnInit {

  constructor() { }

  title = 'CSV Editor Givt'
  myTable: TabulatorTypes.Tabulator
  startDay: string
  startTime: string
  endDay: string
  endTime: string

  ngOnInit() {
    var columns: TabulatorTypes.Tabulator.ColumnDefinition[] = [
      { title: "Start Date", field: "startDate", editor: this.dateEditor, headerSort: true},
      { title: "End Date", field: "endDate", editor: this.dateEditor, headerSort: true},
      { title: "Collect Name", field: "collectName", editor: true, headerSort: true},
      { title: "Collect Id", field: "collectId", editor: "select", editorParams: { values: ["1", "2", "3"] }, headerSort: true},
      { title: "", field: "", headerSort: false, formatter: "buttonCross", width: 30, align: "center", cellTap: function (e, cell) { cell.getRow().delete(); }, cellClick: function (e, cell) { cell.getRow().delete(); } }
    ];

    this.myTable = new TabulatorTable("#tabulator-div", { layout: "fitColumns", columns: columns });
    this.addRow()
  }

  private addRow() {
    this.myTable.addRow({});
  }

  private downloadCSV() {
    this.myTable.download("csv", "data.csv");
  }

  public dateEditor(cell, onRendered, success: TabulatorTypes.Tabulator.ValueVoidCallback, cancel) {
    var cellValue = moment(cell.getValue(), "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm");
    var input = document.createElement("input");
    input.setAttribute("type", "datetime-local");

    input.style.width = "100%";
    input.style.padding = "0 8px 0 4px"

    input.setAttribute("value", moment(cellValue).format("YYYY-MM-DDTHH:mm"))

    onRendered(function () {
      input.focus();
      input.style.height = "100%";
    });
    
    function onChange() {
      success(new Date(input.value).toLocaleString(navigator.language, {day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"}));
    }

    input.addEventListener("focusout", onChange);

    input.addEventListener("keydown", function (e) {
      if (e.keyCode == 13) {
        onChange();
      }

      if (e.keyCode == 27) {
        cancel();
      }
    });
    return input;
  }
}

