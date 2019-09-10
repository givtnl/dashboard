import { FormGroup, ValidatorFn, FormControl, AbstractControl } from '@angular/forms';
import { isNullOrUndefined } from 'util';

export function GreaterThanDateValidator(formGroup: FormGroup): ValidatorFn {
    var retVal = null;

    const start: Date = formGroup.value.dtBegin;
    const end: Date = formGroup.value.dtEnd;

    if (!isNullOrUndefined(start) && !isNullOrUndefined(end) && start >= end) {
        retVal = {
            invalidDate: true
        };
    }

    return retVal;
}

export function DateTimeMinutesAllowedValidator(allowedMinutes: number[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (!isNullOrUndefined(control.value)) {
            const enteredDate: Date = new Date(control.value);
            const enteredMinutes = enteredDate.getMinutes();
            const hasValidInput = allowedMinutes && !allowedMinutes.some(allowedMinute => allowedMinute === enteredMinutes);

            return hasValidInput ? { inValidMinutes: true } : null;
        }
    };
}
