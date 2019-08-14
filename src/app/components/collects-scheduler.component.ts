import { Component, OnInit } from '@angular/core';
import * as TabulatorTypes from "tabulator-tables"
import * as TabulatorTable from "./../../../node_modules/tabulator-tables"
import { TabulatorRowGivt } from 'app/models/TabulatorRowGivt';
import { TabulatorHelper } from 'app/helpers/tabulator-helper';

import * as moment from 'moment'

var tabulatorHelp: TabulatorHelper = null

@Component({
  selector: 'app-csveditor',
  templateUrl: '../html/collects-scheduler.component.html',
  styleUrls: ['../css/collects-scheduler.component.css']
})


export class CollectsShedulerComponent implements OnInit {
  constructor(private tabulatorHelper: TabulatorHelper){
    tabulatorHelp = tabulatorHelper
  }
  title = 'CSV Editor Givt'
  myTable: TabulatorTypes.Tabulator
  myTableRows: TabulatorRowGivt[] = []


  ngOnInit() {
    var columns: TabulatorTypes.Tabulator.ColumnDefinition[] = [
      { title: "Start Date", field: "startDate", editor: this.dateEditor, headerSort: true },
      { title: "End Date", field: "endDate", editor: this.dateEditor, headerSort: true },
      { title: "Collect Name", field: "collectName", headerSort: true },
      { title: "Collect Id", field: "collectId", editor: "select", editorParams: { values: ["1", "2", "3"] }, headerSort: true },
      { title: "", field: "", headerSort: false, formatter: "buttonCross", width: 30, align: "center", cellTap: function (e, cell) { cell.getRow().delete(); }, cellClick: function (e, cell) { cell.getRow().delete(); } }
    ];

    this.myTable = new TabulatorTable("#tabulator-div", { layout: "fitColumns", columns: columns });
    var firstRow = new TabulatorRowGivt()
    firstRow.position = 0
    this.myTableRows.push(firstRow)
    this.myTable.addRow({})
    this.tabulatorHelper._tabulatorRows = this.myTableRows
  }

  private addRow() {
    this.myTable.addRow({});
    var newRow = new TabulatorRowGivt()
    newRow.position = this.myTableRows.length
    this.myTableRows.push(newRow)
    console.log(this.myTable.getRows())
    console.log(this.myTableRows)
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
    
    input.addEventListener("focusout", function () { tabulatorHelp.setField(input, success, cell) });

    input.addEventListener("keydown", function (e) {
      if (e.keyCode == 13 || e.keyCode == 9) { tabulatorHelp.setField(input, success, cell); }
      if (e.keyCode == 27) { cancel(); }
    });

    return input;
  }
  //todo: validate dates so that begin cant be later or equal then date
  //      validate the input of the number and string field ( collect name and id )


}


