import { NgModule, LOCALE_ID }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpModule, Http} from "@angular/http";
import {FormsModule} from "@angular/forms";

import { LoginComponent } from 'app/components/login.component';
import { AppComponent }  from 'app/components/app.component';
import { AppRoutingModule } from "./app.routing";
import { UserService } from "app/services/user.service";
import { NavigationComponent } from "app/components/navigation.component";
import {Router} from "@angular/router";
import {LoggedInGuard} from "./guards/logged-in.guard";
import {LoginComponentGuard} from "./guards/login.component.guard";
import {ApiClientService} from "app/services/api-client.service";
import {DashboardComponent} from "./components/dashboard.component";
import {PayoutsComponent} from "./components/payouts.component";

import {TranslateModule, TranslateLoader, TranslateStaticLoader} from 'ng2-translate';
import {CollectsComponent} from "./components/collects.component";
import {CalendarModule} from "primeng/primeng";
import {DataService} from "./services/data.service";
import {UnAuthorizeComponent} from "./components/unauthorized.component";
import {ReversePipe} from "./pipes/reverse.pipe";
import {ForgotPasswordComponent} from "./components/forgotpassword.component";
import {HashLocationStrategy, Location, LocationStrategy} from '@angular/common';
import {MandateComponent} from "./components/mandate.component";

import { Ng2CompleterModule } from "ng2-completer";
import {AdminGuard} from "./guards/admin.guard";


export function createTranslateLoader(http: Http) {
  return new TranslateStaticLoader(http, './assets/i18n', '.json');
}

@NgModule({
  imports:      [ BrowserModule,Ng2CompleterModule,  AppRoutingModule, HttpModule, FormsModule, AppRoutingModule, TranslateModule.forRoot({
    provide: TranslateLoader,
    useFactory: (createTranslateLoader),
    deps: [Http]
  }),CalendarModule],
  declarations: [ AppComponent, MandateComponent,  LoginComponent, ForgotPasswordComponent , NavigationComponent, DashboardComponent, CollectsComponent, UnAuthorizeComponent, ReversePipe, PayoutsComponent ],
  bootstrap:    [ AppComponent ],
  providers: [ UserService, ApiClientService, AdminGuard, LoggedInGuard, LoginComponentGuard,DataService, { provide: LOCALE_ID, useValue: "nl-BE" }, {provide: LocationStrategy, useClass: HashLocationStrategy}  ]
})
export class AppModule { }
