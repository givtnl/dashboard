import { FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';

export function GreaterThanDateValidator(formGroup: FormGroup): ValidatorFn {
    var retVal = null;

    const start: Date = formGroup.value.dtBegin;
    const end: Date = formGroup.value.dtEnd;

    if (start !== undefined && start !== null && end !== undefined && end !== null && start >= end) {
        retVal = {
            invalidDate: true
        };
    }

    return retVal;
}

export function DateTimeMinutesAllowedValidator(allowedMinutes: number[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (control.value !== undefined && control.value !== null) {
            const enteredDate: Date = new Date(control.value);
            const enteredMinutes = enteredDate.getMinutes();
            const hasValidInput = allowedMinutes && !allowedMinutes.some(allowedMinute => allowedMinute === enteredMinutes);

            return hasValidInput ? { inValidMinutes: true } : null;
        }
    };
}
