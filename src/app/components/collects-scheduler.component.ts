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
  public hasOverlapErrors = false
  public isSuccessfulAllocations = false;

  currentCollectGroupId: string

  paginatorOptions: InfrastructurePaginator = { currentPage: 1, currentRowsPerPage: 10 }

  constructor(private formBuilder: FormBuilder, private userService: UserService, private service: CollectSchedulerService) { }

  ngOnInit() {
    // restore from cache if exists
    const cachedItems = JSON.parse(localStorage.getItem(this.cacheKey))

    this.currentCollectGroupId = this.userService.CurrentCollectGroup.GUID

    this.form = this.formBuilder.group({
      CollectGroupId: [this.currentCollectGroupId],
      collects: this.formBuilder.array(cachedItems ? cachedItems.collects.map(x => this.buildSingleForm(x)) : [])
    });
    // todo fetch from server?
    if (!cachedItems || !cachedItems.collects || cachedItems.collects.length === 0) {
      this.addEmptyRow();
    }
    // hook the value change event handler
    this.form.valueChanges.subscribe(x => {
      localStorage.setItem(this.cacheKey, JSON.stringify(x))
    });
  }

  public get collectsArray(): FormArray {
    return this.form.get('collects') as FormArray;
  }

  buildSingleForm(scheduler: any = null, copyId: boolean = false): FormGroup {
    const form = this.formBuilder.group(
      {
        id: [scheduler && copyId ? scheduler.id : 0],
        dtBegin: [scheduler ? scheduler.dtBegin : null, [Validators.required]],
        dtEnd: [scheduler ? scheduler.dtEnd : null, [Validators.required]],
        name: [scheduler ? scheduler.name : null, [Validators.required, Validators.maxLength(50), Validators.minLength(3)]],
        collectId: [scheduler ? scheduler.collectId : 1, [Validators.required, Validators.min(1), Validators.max(3)]]
      },
      { validator: GreaterThanDateValidator }
    );

    form.valueChanges
      .pipe(debounceTime(1500))
      .pipe(distinctUntilChanged((oldValue, newValue) => JSON.stringify(oldValue) === JSON.stringify(newValue)))
      .subscribe((x: AllocationDetailModel) => this.upload(form));

    return form;

  }

  addEmptyRow(index: number = 0) {
    this.collectsArray.insert(index, this.buildSingleForm());
  }

  removeRow(index: number) {
    const toDeleteFormGroup = this.collectsArray.at(index);
    if (toDeleteFormGroup.value.id > 0) {
      //  blabladelete
      // then.
    } else {
      this.removeRowConfirm(index);
    }
  }

  removeRowConfirm(index: number) {
    this.collectsArray.removeAt(index);
  }

  copyRow(index: number) {
    this.collectsArray.insert(index, this.buildSingleForm(this.collectsArray.at(index).value));
  }

  upload(row: FormGroup) {
    if (row.invalid) {
      return;
    }
    if (row.value.id && row.value.id > 0) {
      this.service
        .updateAllocation(this.currentCollectGroupId, row.value.id, row.value)
        .pipe(catchError((error: HttpErrorResponse) => (error.status === 409 ? this.handleConflict(error, row) : this.handleGenericError())))
        .subscribe(x => console.log('AH YEET update GELUKT'));
    } else {
      this.service
        .createAllocation(this.currentCollectGroupId, row.value)
        .pipe(catchError((error: HttpErrorResponse) => (error.status === 409 ? this.handleConflict(error, row) : this.handleGenericError())))
        .subscribe(x => row.patchValue({ id: x.Id }));
    }

  }

  onPaginatorChanged(e: InfrastructurePaginator) {
    this.paginatorOptions = e
  }
  handleConflict(error: any, form: FormGroup) {
    this.hasOverlapErrors = true;
    form.setErrors({ overlap: true });
    return Observable.throw(error);

  }
  handleGenericError() {
    console.log('generic');
    return Observable.throw('generic error ofzo');

  }
}