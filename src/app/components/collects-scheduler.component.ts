import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ValidatorFn } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'app/services/user.service';
import { isNullOrUndefined } from 'util';
import { distinctUntilChanged, debounceTime } from 'rxjs/operators';

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

  constructor(private formBuilder: FormBuilder, private userService: UserService) { }

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
    const form = this.formBuilder.group({
      Id: [scheduler && copyId ? scheduler.Id : 0],
      dtBegin: [scheduler ? scheduler.dtBegin : null, [Validators.required]],
      dtEnd: [scheduler ? scheduler.dtEnd : null, [Validators.required]],
      Name: [scheduler ? scheduler.Name : null, [Validators.required, Validators.maxLength(50), Validators.minLength(3)]],
      CollectId: [scheduler ? scheduler.CollectId : 1, [Validators.required, Validators.min(1), Validators.max(3)]]
    }, { validator: GreaterThanDateValidator });

    form.valueChanges
      .pipe(debounceTime(2000))
      .pipe(distinctUntilChanged())
      .subscribe(x => this.upload(x));

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
    this.collectsArray.insert(index, this.buildSingleForm(this.collectsArray.at(index).value))
  }

  upload(row: any) {
    console.log('row changed ', row);
    // id if === 0
    //create
    //else
    //update
  }
  handleConflict(error: any) {
    this.hasOverlapErrors = true
    this.collectsArray.at(error.error.RowNumber).setErrors({ overlap: true })
  }
  handleGenericError() {
    console.log("generic")
  }
}





