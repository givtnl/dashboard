import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ValidatorFn } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from 'app/services/user.service';
import { isNullOrUndefined } from 'util';
import { distinctUntilChanged, debounceTime, catchError } from 'rxjs/operators';
import { InfrastructurePaginator } from 'app/models/infrastructure-paginator';
import { CollectSchedulerService } from 'app/services/collects-schedulder.service';
import { Observable } from 'rxjs';
import { ISODatePipe } from 'app/pipes/iso.datepipe';
import { LoggingService } from 'app/services/logging.service';
import { compareRows } from 'app/models/collect-scheduler/row-comparer.function';
import { GreaterThanDateValidator, DateTimeMinutesAllowedValidator } from 'app/validators/allocation.validators';

@Component({
    selector: 'app-csveditor',
    templateUrl: '../html/collects-scheduler.component.html',
    styleUrls: ['../css/collects-scheduler.component.scss']
})
export class CollectsShedulerComponent implements OnInit {
    public form: FormGroup;
    public cacheKey = 'CollectSchedulerComponent';

    currentCollectGroupAllocations = [];

    currentTotalNumberOfPages: 0;
    currentTotalCountOfRows: 0;
    pageSettings = { currentPage: 1, currentRowsPerPage: 10 };

    constructor(
        private formBuilder: FormBuilder,
        private userService: UserService,
        private service: CollectSchedulerService,
        private datePipe: ISODatePipe,
        private loggingService: LoggingService
    ) {
        this.userService.collectGroupChanged.subscribe(() => {
            this.ngOnInit();
        });
    }

    ngOnInit() {
        this.getRows(this.pageSettings);
    }

    public get collectsArray(): FormArray {
        return this.form.get('collects') as FormArray;
    }

    buildSingleForm(scheduler: any = null, copyId: boolean = false): FormGroup {
        const form = this.formBuilder.group(
            {
                id: [scheduler && copyId ? scheduler.Id : 0],
                dtBegin: [
                    scheduler && scheduler.dtBegin ? this.datePipe.transform(new Date(scheduler.dtBegin), 'yyyy-MM-ddTHH:mm') : null,
                    [Validators.required]
                ],
                dtEnd: [
                    scheduler && scheduler.dtEnd ? this.datePipe.transform(new Date(scheduler.dtEnd), 'yyyy-MM-ddTHH:mm') : null,
                    [Validators.required]
                ],
                name: [scheduler ? scheduler.Name : null, [Validators.required, Validators.maxLength(50), Validators.minLength(3)]],
                collectId: [scheduler ? scheduler.CollectId : 1, [Validators.required, Validators.min(1), Validators.max(3)]]
            },
            { validator: GreaterThanDateValidator }
        );

        form.valueChanges
            .pipe(debounceTime(1500))
            .pipe(distinctUntilChanged((oldValue: any, newValue: any) => compareRows(oldValue, newValue)))
            .subscribe(x => this.upload(form));

        return form;
    }

    addEmptyRow(index: number = 0) {
        this.collectsArray.insert(index, this.buildSingleForm());
    }

    removeRow(index: number) {
        const toDeleteFormGroup = this.collectsArray.at(index);
        if (toDeleteFormGroup.value.id > 0) {
            this.service
                .deleteAllocation(this.userService.CurrentCollectGroup.GUID, toDeleteFormGroup.value.id)
                .pipe(catchError((error: HttpErrorResponse) => this.handleGenericError(error)))
                .subscribe(x => this.removeRowConfirm(index));
        } else {
            this.removeRowConfirm(index);
        }
    }

    removeRowConfirm(index: number) {
        this.collectsArray.removeAt(index);
    }

    copyRow(index: number) {
        var row = this.collectsArray.at(index).value;

        this.collectsArray.insert(
            index,
            this.buildSingleForm({
                CollectId: row.collectId,
                Name: row.name,
                dtBegin: row.dtBegin,
                dtEnd: row.dtEnd
            })
        );
    }
    getRows(options: InfrastructurePaginator) {
        this.service
            .getAll(this.userService.CurrentCollectGroup.GUID, options.currentRowsPerPage, options.currentPage)
            .pipe(catchError((error: HttpErrorResponse) => this.handleGenericError(error)))
            .subscribe(response => {
                this.currentCollectGroupAllocations = response.Results;
                this.currentTotalNumberOfPages = response.TotalNumberOfPages;
                this.currentTotalCountOfRows = response.TotalCount;
                this.form = this.formBuilder.group({
                    collects: this.formBuilder.array(
                        this.currentCollectGroupAllocations
                            ? this.currentCollectGroupAllocations.map(x => this.buildSingleForm(x, true))
                            : []
                    )
                });
            });
    }
    upload(row: FormGroup) {
        if (row.invalid) {
            return;
        }
        if (row.value.id && row.value.id > 0) {
            // update existing allocation
            this.service
                .updateAllocation(this.userService.CurrentCollectGroup.GUID, row.value.id, row.value)
                .pipe(
                    catchError((error: HttpErrorResponse) =>
                        error.status === 409 ? this.handleConflict(error, row) : this.handleGenericError()
                    )
                )
                .subscribe(x =>
                    this.loggingService.info(
                        `Allocation with id '${row.value.id}' was updated for CollectGroup: ${this.userService.CurrentCollectGroup.Name}`
                    )
                );
        } else {
            // create a new allocation
            this.service
                .createAllocation(this.userService.CurrentCollectGroup.GUID, row.value)
                .pipe(
                    catchError((error: HttpErrorResponse) =>
                        error.status === 409 ? this.handleConflict(error, row) : this.handleGenericError()
                    )
                )
                .subscribe(x => {
                    this.loggingService.info(
                        `Allocation with id '${x.Id}' was created for CollectGroup: ${this.userService.CurrentCollectGroup.Name}`
                    );
                    row.patchValue({ id: x.Id });
                });
        }
    }
    handleConflict(error: any, form: FormGroup) {
        form.setErrors({ overlap: true });
        return Observable.throw(error);
    }
    handleGenericError(error: any = null) {
        console.log(error != null ? error : 'generic error');
        return Observable.throw(error != null ? error : 'generic error');
    }

    hasErrors(): boolean {
        return this.form &&  this.collectsArray &&  this.collectsArray.controls.some((formGroup: FormGroup) => {
            return formGroup.errors !== null || Object.keys(formGroup.controls).some(key => formGroup.get(key).errors !== null);
        });
    }
}
