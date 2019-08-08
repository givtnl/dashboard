import { Component, OnInit } from '@angular/core';
import Tabulator from 'tabulator-tables';
import { Moment } from 'moment';
declare var moment: any

@Component({
  selector: 'app-csveditor',
  templateUrl: '../html/csveditor.component.html',
  styleUrls: ['../css/csveditor.component.css']
})
export class CSVEditorComponent implements OnInit {

  constructor() { }

  title = 'CSV Editor Givt';
  columnNames: any[] = [];
  myTable: Tabulator;


  ngOnInit() {
    this.myTable = new Tabulator("#tabulator-div", {
      movableRows:true,
      layout:"fitColumns",
      columns:[
        { rowHandle:true, formatter:"handle", headerSort:false,frozen:true, width:30, minWidth:30},
        { title: "Start Date", field: "startDate", sorter:"date", editor:this.dateEditor},
        { title: "Start Time", field: "startTime", sorter:"time", editor:this.timeEditor },
        { title: "End Date", field: "endDate", sorter:"date", editor:this.dateEditor, validator:[{
          type:this.CheckEndDate,
        }]},
        { title: "End Time", field: "endTime", sorter:"time", editor:this.timeEditor, validator:[{
          type:this.CheckEndTime,
        }]},
        { title: "Collect Name", field: "collectName", editor:true },
        { title: "Collect Id", field: "collectId", editor:"select", editorParams:{values:["1", "2","3"]}},
        {formatter:"buttonCross", width:30, align:"center", 
          cellTap:function(e, cell) {
            cell.getRow().delete();
          },
          cellClick:function(e, cell) {
            cell.getRow().delete();
          },
        },  
      ],
    });
    
    for (let i = 1; i <= 3; i++) {
      this.addRow();
    }
  
  }

  public addRow() {
    this.myTable.addRow({});
  };

  public downloadCSV() {
    this.myTable.download("csv", "data.csv");
  }

  public dateEditor(cell, onRendered, success, cancel){
      var cellValue = moment(cell.getValue(), "DD/MM/YYYY").format("YYYY-MM-DD"),
      input = document.createElement("input");
  
      input.setAttribute("type", "date");
  
      input.style.padding = "4px";
      input.style.width = "100%";
      input.style.boxSizing = "border-box";
  
      input.value = cellValue;
  
      onRendered(function(){
          input.focus();
          input.style.height = "100%";
      });
  
      function onChange(){
          if(input.value != cellValue){
              success(moment(input.value, "YYYY-MM-DD").format("DD/MM/YYYY"));
          }else{
              cancel();
          }
      }

      input.addEventListener("change", onChange);
      input.addEventListener("blur", onChange);
  
      input.addEventListener("keydown", function(e){
          if(e.keyCode == 13){
              onChange();
          }
  
          if(e.keyCode == 27){
              cancel();
          }
      });
  
      return input;
  };

  public timeEditor(cell, onRendered, success, cancel){
    var cellValue = moment(cell.getValue(), "hh:mm").format("hh:mm"),
    input = document.createElement("input");

    input.setAttribute("type", "time");

    input.style.padding = "4px";
    input.style.width = "100%";
    input.style.boxSizing = "border-box";

    input.value = cellValue;

    onRendered(function(){
        input.focus();
        input.style.height = "100%";
    });

    function onChange(){
        if(input.value != cellValue){
            success(moment(input.value, "hh:mm").format("hh:mm"));
        }else{
            cancel();
        }
    }

    input.addEventListener("change", onChange);
    input.addEventListener("blur", onChange);

    input.addEventListener("keydown", function(e){
        if(e.keyCode == 13){
            onChange();
        }

        if(e.keyCode == 27){
            cancel();
        }
    });

    return input;
  };

  public CheckEndDate(cell, value){
     cell.getValue("startDate");
     return false;
  }

  public CheckEndTime(cell, value){
    var sTime = cell.getValue("startTime");
    if (value < sTime){
      console.log('shizzle');
      return false;
    }
 }
}

