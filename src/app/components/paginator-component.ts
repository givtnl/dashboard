import { Component, Output, EventEmitter } from "@angular/core";
import { InfrastructurePaginator } from "app/models/infrastructure-paginator";

@Component({
  selector: 'my-paginator',
  templateUrl: '../html/paginator.component.html',
  styleUrls: ['../css/paginator.component.scss']
})

export class PaginatorComponent {
  settings: InfrastructurePaginator = {
    currentPage: 1,
    currentRowsPerPage: 10
  }

  @Output() paginatorChanged = new EventEmitter<InfrastructurePaginator>()

  constructor() { }

  paginatorChanges(e: any) {
    if (e === 0) { // 0 means page down
      if (this.settings.currentPage > 1) {
        this.settings.currentPage--
      }
    } else if (e === 1) {
      this.settings.currentPage++
    } else {
      this.settings.currentRowsPerPage = Number(e)
    }
    this.paginatorChanged.emit(this.settings)
  }
}





