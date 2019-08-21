import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ValidatorFn, FormControl } from '@angular/forms';
import { environment } from 'environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { UserService } from 'app/services/user.service';
import { isNullOrUndefined } from 'util';
import { catchError } from 'rxjs/operators';
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

  constructor(private formBuilder: FormBuilder, private http: HttpClient, private userService: UserService) { }

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
    this.form.valueChanges.subscribe(x => localStorage.setItem(this.cacheKey, JSON.stringify(x)));
  }

  public get collectsArray(): FormArray {
    return this.form.get('collects') as FormArray;
  }

  buildSingleForm(scheduler: any = null): FormGroup {
    return this.formBuilder.group({
      Id: [scheduler ? scheduler.Id : 0],
      dtBegin: [scheduler ? scheduler.dtBegin : null, [Validators.required]],
      dtEnd: [scheduler ? scheduler.dtEnd : null, [Validators.required]],
      Name: [scheduler ? scheduler.Name : null, [Validators.required, Validators.maxLength(50), Validators.minLength(3)]],
      CollectId: [scheduler ? scheduler.CollectId : 1, [Validators.required, Validators.min(1), Validators.max(3)]]
    }, { validator: GreaterThanDateValidator })
  }

  addEmptyRow() {
    var selectedRow = this.collectsArray.controls.find(x => x.touched == true)
    if (selectedRow) {
      this.collectsArray.insert(this.collectsArray.controls.indexOf(selectedRow), this.buildSingleForm(selectedRow.value))
      selectedRow.markAsUntouched()
    } else {
      this.collectsArray.push(this.buildSingleForm());
    }
  }

  removeRow(index: number) {
    this.collectsArray.removeAt(index);
  }

  copyRow(index: number) {
    this.collectsArray.push(this.buildSingleForm(this.collectsArray.at(index).value))
  }

  upload() {
    this.hasOverlapErrors = false;
    this.isSuccessfulAllocations = false;

    this.http.post(`${environment.apiUrl}/api/v2/allocations/allocation`, this.form.value)
      .pipe(catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 409:
            this.handleConflict(error);
            break;
          default:
            this.handleGenericError();
        }
        return Observable.throw(error);
      }))
      .subscribe(() => {
        localStorage.removeItem(this.cacheKey)
        this.isSuccessfulAllocations = true
      });
  }
  handleConflict(error: any) {
    this.hasOverlapErrors = true
    this.collectsArray.at(error.error.RowNumber).setErrors({ overlap: true })
  }
  handleGenericError() {
    console.log("generic")
  }
}





