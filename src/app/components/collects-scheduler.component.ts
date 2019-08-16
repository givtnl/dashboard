import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ValidatorFn, FormControl } from '@angular/forms';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { DataService } from 'app/services/data.service';
import { UserService } from 'app/services/user.service';



const GreaterThanDateValidator: ValidatorFn = (formGroup: FormGroup) => {
  const start: Date = formGroup.value.startDate;
  const end: Date = formGroup.value.endDate;
  if (end > start) {
    return null
  } else
    return {
      GreaterThanDateValidator: {
        valid: false
      }
    }
}


@Component({
  selector: 'app-csveditor',
  templateUrl: '../html/collects-scheduler.component.html',
  styleUrls: ['../css/collects-scheduler.component.scss']
})

export class CollectsShedulerComponent implements OnInit {

  public form: FormGroup;
  public cacheKey = 'CollectSchedulerComponent';

  currentCollectGroupId: string

  constructor(private formBuilder: FormBuilder, private http: HttpClient, private userService: UserService) { }

  ngOnInit() {

    this.currentCollectGroupId = this.userService.CurrentCollectGroup.GUID

    this.form = this.formBuilder.group({
      collects: this.formBuilder.array([])
    });
    // todo fetch from server?
    this.addEmptyRow();

    // restore from cache if exists
    const cachedItems = JSON.parse(localStorage.getItem(this.cacheKey));
    console.log(cachedItems.collects.length)
    if (cachedItems) {
      for(var i = 1; i< cachedItems.collects.length; i++)
        this.addEmptyRow()
      this.form.setValue(cachedItems);
    }
    // hook the value change event handler
    this.form.valueChanges.subscribe(x => localStorage.setItem(this.cacheKey, JSON.stringify(x)));

  }

  public get collectsArray(): FormArray {
    return this.form.get('collects') as FormArray;
  }

  buildSingleForm(scheduler: any = null): FormGroup {
    return this.formBuilder.group({
      dtBegin: [scheduler ? scheduler.startDate.toISOString().substring(0, 16) : null, [Validators.required]],
      dtEnd: [scheduler ? scheduler.endDate.toISOString().substring(0, 16) : null, [Validators.required]],
      Name: [scheduler ? scheduler.description : null, [Validators.required, Validators.maxLength(50), Validators.minLength(3)]],
      CollectId: [scheduler ? scheduler.collectId : 1, [Validators.required, Validators.min(1), Validators.max(3)]],
      CollectGroupId: [this.currentCollectGroupId]
    }, { validator: GreaterThanDateValidator })
  }

  addEmptyRow() {
    this.collectsArray.push(this.buildSingleForm());
  }

  removeRow(index: any) {
    this.collectsArray.removeAt(index);
  }

  upload() {
    this.http.post(`${environment.apiUrl}/api/v2/allocations/allocation`, this.form.value)
      .subscribe(x => console.log('geluuukt'), error => console.log('misluuukt'));
  }
}


