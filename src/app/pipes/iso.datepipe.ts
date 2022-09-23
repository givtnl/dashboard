import {DatePipe} from '@angular/common';
import {Pipe, PipeTransform} from "@angular/core";
import {sprintf} from "sprintf-js"

@Pipe({ name: 'isoDate' })
export class ISODatePipe extends DatePipe implements PipeTransform {
    constructor(){
        super(navigator.language.includes('nl') ? 'nl-NL' : 'en-GB');
    }
    toISODateUTC(value: Date) : string {
        return sprintf("%04i-%02i-%02iT%02i:%02i:%02i.%03i",
            value.getUTCFullYear(), value.getUTCMonth()+1, value.getUTCDate(),
            value.getUTCHours(), value.getUTCMinutes(), value.getUTCSeconds(), value.getUTCMilliseconds()) + "Z";
    }

    getLocalTimeZoneISOString() : string {
        let value = new Date();
        let tzhours = value.getTimezoneOffset() / 60 * -1;
        let negative = tzhours < 0;
        tzhours = Math.abs(tzhours);
        let tzminutes = (value.getTimezoneOffset() % 60) * -1;
        return sprintf("%s%02i:%02i", negative ? "-" : "+", tzhours, tzminutes);
    }
}