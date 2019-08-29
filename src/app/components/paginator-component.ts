import { Component, Output, EventEmitter, Input, OnInit } from "@angular/core";
import { InfrastructurePaginator } from "app/models/infrastructure-paginator";
import { UserService } from "app/services/user.service";
import { FormGroup, FormBuilder } from "@angular/forms";

@Component({
  selector: 'my-paginator',
  templateUrl: '../html/paginator.component.html',
  styleUrls: ['../css/paginator.component.scss']
})

export class PaginatorComponent implements OnInit {

  settings: InfrastructurePaginator = {
    currentPage: 1,
    currentRowsPerPage: 10
  }
  currentRowsPerPageForm: FormGroup;
  rowsPerPage = [10,20,30,40];

  @Output() paginatorChanged = new EventEmitter<InfrastructurePaginator>()
  @Input() rowsOnPage = 0
  constructor(private userService: UserService, private formBuilder: FormBuilder) { 
    this.userService.collectGroupChanged.subscribe(() => {
      this.ngOnInit();
    });
  }

  ngOnInit() {
    console.log("Initiliazing Paginator...")

    this.currentRowsPerPageForm = this.formBuilder.group({
      currentRowsPerPageControl: [10]
    });
    
    this.currentRowsPerPageForm.valueChanges.subscribe(x => {
      this.settings.currentPage = 1
      this.settings.currentRowsPerPage = Number(x.currentRowsPerPageControl)
      this.paginatorChanged.emit(this.settings)
    })

  }
  
  paginatorChanges(e: any) {
    if (e === 0) { // 0 means page down
      if (this.settings.currentPage > 1)
        this.settings.currentPage--
    } else if (e === 1) {
      if (this.rowsOnPage == this.settings.currentRowsPerPage)
        this.settings.currentPage++
    }
    this.paginatorChanged.emit(this.settings)
  }
}





