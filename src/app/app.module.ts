import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {HttpModule, Http} from '@angular/http';
import {HashLocationStrategy, LocationStrategy, DatePipe} from '@angular/common';
import { AppComponent } from './components/app.component';
import { LoginComponent } from 'app/components/login.component';
import {AppRoutingModule} from "./app.routing";
import {TranslateModule, TranslateLoader, TranslateStaticLoader} from "ng2-translate";
import {DataService} from "./services/data.service";
import {UserService} from "./services/user.service";
import {DashboardComponent} from "./components/dashboard.component";
import {ApiClientService} from "./services/api-client.service";
import {LoginComponentGuard} from "./guards/login.component.guard";
import {LoggedInGuard} from "./guards/logged-in.guard";
import {AdminGuard} from "./guards/admin.guard";
import {NavigationComponent} from "./components/navigation.component";
import {CollectsComponent} from "./components/collects.component";
import {ReversePipe} from "./pipes/reverse.pipe";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {PayoutsComponent} from "./components/payouts.component";
import {MandateComponent} from "./components/mandate.component";
import {ForgotPasswordComponent} from "./components/forgotpassword.component";
import {UnAuthorizeComponent} from "./components/unauthorized.component";
import {AssignComponent} from "./components/assign.component";
import { PayoutComponent } from "./components/children/payout-element.component"

import * as jQuery from 'jquery';
import { AutoCompleteModule, ScheduleModule, DialogModule, CalendarModule, DropdownModule } from 'primeng/primeng';
(window as any).jQuery = (window as any).$ = jQuery; // This is needed to resolve issue.

export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, './assets/i18n', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    NavigationComponent,
    CollectsComponent,
    ReversePipe,
    PayoutsComponent,
    MandateComponent,
    ForgotPasswordComponent,
    UnAuthorizeComponent,
    AssignComponent,
    PayoutComponent
  ],
  imports: [
    AutoCompleteModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    ScheduleModule,
    CalendarModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    ScheduleModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
    }),
    CalendarModule
  ],
  providers: [
      DataService,
    UserService,
    ApiClientService,
    AdminGuard,
    LoggedInGuard,
    LoginComponentGuard,
    {
      provide: LOCALE_ID,
      useValue: "nl-BE"
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
