import { Directive, HostListener, Input } from '@angular/core';
import { UserService } from 'app/services/user.service';
// declare ga as a function to set and sent the events
declare let gtag: Function;

@Directive({ selector: '[analytics]' })
export class GoogleAnalyticsDirective {
    constructor(private userService: UserService) {}

    @Input()
    public eventName: string;

    @Input()
    public category: string;

    @HostListener('click') onClick($event) {
        gtag('event', this.eventName, {
            event_category: this.category,
            event_label: this.userService.CurrentCollectGroup.Name
        });
        // gtag('send', 'event', {
        //     eventCategory: 'Button',
        //     eventAction: 'click',
        //     eventLabel: this.eventName
        // });
    }
}
