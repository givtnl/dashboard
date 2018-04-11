import {DatePipe} from '@angular/common';
import {Pipe} from "@angular/core";

@Pipe({ name: 'isoDate' })
export class ISODatePipe extends DatePipe {
    toISODateNoLocale(value: any) : string {
        return super.transform(value, "yyyy-MM-ddTHH:mm:ss.sss") + "Z";
    }
}