import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ValidatorFn } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { UserService } from 'app/services/user.service';
import { isNullOrUndefined } from 'util';
import { distinctUntilChanged, debounceTime, catchError } from 'rxjs/operators';
import { InfrastructurePaginator } from 'app/models/infrastructure-paginator';
import { CollectSchedulerService } from 'app/services/collects-schedulder.service';
import { AllocationDetailModel } from 'app/models/collect-scheduler/allocation-detail.model';
import { Observable } from 'rxjs';
import { ISODatePipe } from 'app/pipes/iso.datepipe';

const GreaterThanDateValidator: ValidatorFn = (formGroup: FormGroup) => {
  var retVal = null

  const start: Date = formGroup.value.dtBegin;
  const end: Date = formGroup.value.dtEnd;

  if (!isNullOrUndefined(start) && !isNullOrUndefined(end) && (start >= end)) {
    retVal = {
      invalidDate: true
    }
  }

  return retVal
}


@Component({
  selector: 'app-csveditor',
  templateUrl: '../html/collects-scheduler.component.html',
  styleUrls: ['../css/collects-scheduler.component.scss']
})

export class CollectsShedulerComponent implements OnInit {

  public form: FormGroup;
  public cacheKey = 'CollectSchedulerComponent';

  currentCollectGroupAllocations = []

  constructor(private formBuilder: FormBuilder, private userService: UserService, private service: CollectSchedulerService, private datePipe: ISODatePipe) {
    this.userService.collectGroupChanged.subscribe(() => {
      this.ngOnInit();
    });
  }

  ngOnInit() {
    this.getRows({ currentPage: 1, currentRowsPerPage: 10 })
  }

  public get collectsArray(): FormArray {
    return this.form.get('collects') as FormArray;
  }

  buildSingleForm(scheduler: any = null, copyId: boolean = false): FormGroup {
    const form = this.formBuilder.group(
      {
        id: [scheduler && copyId ? scheduler.Id : 0],
        dtBegin: [scheduler ? this.datePipe.transform(new Date(scheduler.dtBegin), "yyyy-MM-ddTHH:mm") : null, [Validators.required]],
        dtEnd: [scheduler ? this.datePipe.transform(new Date(scheduler.dtEnd), "yyyy-MM-ddTHH:mm") : null, [Validators.required]],
        name: [scheduler ? scheduler.Name : null, [Validators.required, Validators.maxLength(50), Validators.minLength(3)]],
        collectId: [scheduler ? scheduler.CollectId : 1, [Validators.required, Validators.min(1), Validators.max(3)]]
      },
      { validator: GreaterThanDateValidator }
    );

    form.valueChanges
      .pipe(debounceTime(1500))
      .pipe(distinctUntilChanged((oldValue, newValue) => JSON.stringify(oldValue) === JSON.stringify(newValue)))
      .subscribe(x => this.upload(form));

    return form;

  }

  addEmptyRow(index: number = 0) {
    this.collectsArray.insert(index, this.buildSingleForm());
  }

  removeRow(index: number) {
    const toDeleteFormGroup = this.collectsArray.at(index);
    if (toDeleteFormGroup.value.id > 0) {
      this.service.deleteAllocation(this.userService.CurrentCollectGroup.GUID, toDeleteFormGroup.value.id)
            .pipe(catchError((error: HttpErrorResponse) => this.handleGenericError(error)))
            .subscribe(x => this.removeRowConfirm(index))
    } else {
      this.removeRowConfirm(index);
    }
  }

  removeRowConfirm(index: number) {
    this.collectsArray.removeAt(index);
  }

  copyRow(index: number) {
    var row = this.collectsArray.at(index).value
  
    this.collectsArray.insert(index, this.buildSingleForm({
      CollectId: row.collectId,
      Name: row.name,
      dtBegin: row.dtBegin,
      dtEnd: row.dtEnd,
    }));
  }
  getRows(options: InfrastructurePaginator) {
    this.service
      .getAll(this.userService.CurrentCollectGroup.GUID, options.currentRowsPerPage, options.currentPage)
      .pipe(catchError((error: HttpErrorResponse) => this.handleGenericError(error)))
      .subscribe(response => {
        this.currentCollectGroupAllocations = response
        this.form = this.formBuilder.group({
          collects: this.formBuilder.array(this.currentCollectGroupAllocations ? this.currentCollectGroupAllocations.map(x => this.buildSingleForm(x, true)) : [])
        });
      })
  }
  upload(row: FormGroup) {
    if (row.invalid) {
      return;
    }
    if (row.value.id && row.value.id > 0) {
      this.service
        .updateAllocation(this.userService.CurrentCollectGroup.GUID, row.value.id, row.value)
        .pipe(catchError((error: HttpErrorResponse) => (error.status === 409 ? this.handleConflict(error, row) : this.handleGenericError())))
        .subscribe(x => console.log('AH YEET update GELUKT'));
    } else {
      this.service
        .createAllocation(this.userService.CurrentCollectGroup.GUID, row.value)
        .pipe(catchError((error: HttpErrorResponse) => (error.status === 409 ? this.handleConflict(error, row) : this.handleGenericError())))
        .subscribe(x => row.patchValue({ id: x.Id }));
    }

  }


  handleConflict(error: any, form: FormGroup) {
    form.setErrors({ overlap: true });
    return Observable.throw(error);

  }
  handleGenericError(error: any = null) {
    console.log(error != null ? error : "generic error");
    return Observable.throw(error != null ? error : "generic error");

  }
}