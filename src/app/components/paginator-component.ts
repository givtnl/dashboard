import { Component, Output, EventEmitter, Input, OnInit } from "@angular/core";
import { InfrastructurePaginator } from "app/models/infrastructure-paginator";
import { UserService } from "app/services/user.service";
import { FormGroup, FormBuilder } from "@angular/forms";
import { TranslateService } from "ng2-translate";
import './../extensions/StringExtensions'

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
  rowsPerPage = [10, 20, 30, 40];
  pageInfo = ""
  

  @Output() paginatorChanged = new EventEmitter<InfrastructurePaginator>()

  @Input() rowsOnPage = 0
  @Input() totalCount = 0
  @Input() totalNumberOfPages = 1

  constructor(private userService: UserService, private formBuilder: FormBuilder, private translateService: TranslateService) {
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
    this.translateService.get("CollectRosterPage").subscribe((res: string) =>  {
      this.pageInfo = String.prototype.format(res, this.settings.currentPage.toString(), this.totalNumberOfPages.toString())
    })

  }

  paginatorChanges(e: any) {
    let oldValue = this.settings.currentPage
    if (e === 0 && this.settings.currentPage > 1) {
      this.settings.currentPage--;
    } else if (e === 1 && this.settings.currentPage < this.totalNumberOfPages) {
      this.settings.currentPage++
    }
    if (this.settings.currentPage != oldValue) {
      this.translateService.get("CollectRosterPage").subscribe((res: string) =>  {
        this.pageInfo = String.prototype.format(res, this.settings.currentPage.toString(), this.totalNumberOfPages.toString())
      })
      this.paginatorChanged.emit(this.settings)
    }
  }
}





