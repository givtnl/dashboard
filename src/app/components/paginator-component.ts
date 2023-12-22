import { Component, Output, EventEmitter, Input, OnInit } from "@angular/core";
import { InfrastructurePaginator } from "../models/infrastructure-paginator";
import { FormGroup, FormBuilder } from "@angular/forms";
import './../extensions/StringExtensions'

@Component({
  selector: 'my-paginator',
  templateUrl: '../html/paginator.component.html',
  styleUrls: ['../css/paginator.component.css']
})

export class PaginatorComponent implements OnInit {

  settings: InfrastructurePaginator = {
    currentPage: 1,
    currentRowsPerPage: 10
  }
  currentRowsPerPageForm: FormGroup;
  rowsPerPage = [10, 20, 30, 40];
  

  @Output() paginatorChanged = new EventEmitter<InfrastructurePaginator>()

  @Input() rowsOnPage = 10;
  @Input() totalCount = 0;
  @Input() totalNumberOfPages = 1;

  constructor( private formBuilder: FormBuilder) {

  }

  ngOnInit() {
    this.currentRowsPerPageForm = this.formBuilder.group({
      currentRowsPerPageControl: [10]
    });
    
    this.currentRowsPerPageForm.valueChanges
    .subscribe(x => {
      this.settings.currentPage = 1;
      this.settings.currentRowsPerPage = +x.currentRowsPerPageControl;
      this.paginatorChanged.emit(this.settings);
    })
  }

  increasePage(){
    if(this.settings.currentPage +1 > this.totalNumberOfPages){
      return;
    }
    this.settings.currentPage++;
    this.paginatorChanged.emit(this.settings)
  }

  decreasePage(){
    if(this.settings.currentPage <= 1){
      return;
    }
    
    this.settings.currentPage--;
    this.paginatorChanged.emit(this.settings)
  }

}





