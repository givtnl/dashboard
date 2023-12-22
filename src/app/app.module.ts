import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './components/app.component';
import { LoginComponent } from './components/login.component';
import { AppRoutingModule } from './app.routing';
import { TranslateModule, TranslateLoader, MissingTranslationHandler } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DataService } from './services/data.service';
import { UserService } from './services/user.service';
import { ApiClientService } from './services/api-client.service';
import { LoggingService } from './services/logging.service';
import { DashboardComponent } from './components/dashboard.component';
import { LoginComponentGuard } from './guards/login.component.guard';
import { LoggedInGuard } from './guards/logged-in.guard';
import { OperationsGuard } from './guards/operations.guard';
import { NavigationComponent } from './components/navigation.component';
import { TitlebarComponent } from './components/titlebar.component';
import { CollectsComponent } from './components/collects.component';
import { ReversePipe } from './pipes/reverse.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PayoutsComponent } from './components/payouts.component';
import { CollectsShedulerComponent } from './components/collects-scheduler.component';
import { ForgotPasswordComponent } from './components/forgotpassword.component';
import { UnAuthorizeComponent } from './components/unauthorized.component';
import { AssignComponent } from './components/assign.component';
import { PayoutComponent } from './components/children/payout-element.component';
import { FooterComponent } from './components/footer.component';
import { AlertComponent } from './components/alert.component';
import { NgChartsModule } from 'ng2-charts';
import { FullCalendarModule } from '@fullcalendar/angular';

import * as jQuery from 'jquery';
import { AutoCompleteModule } from 'primeng/autocomplete';
// import { ScheduleModule } from 'primeng';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { LoggedOutComponent } from './components/loggedout.component';
import { ISODatePipe } from './pipes/iso.datepipe';
import { SettingsComponent } from './components/settings.component';
import { QRCodeComponent } from './components/qrcode.component';
import { BearerTokenInterceptor } from './interceptors/bearer-token-interceptor';
import { AcceptHeaderInterceptor } from './interceptors/accept-header.interceptor';
import { PaginatorComponent } from './components/paginator-component';
import { CollectSchedulerService } from './services/collects-schedulder.service';
import { GoogleAnalyticsDirective } from './directives/google-analytics-directive';
import { PayoutTranslateResolver } from './resolvers/payout-translate-resolver';
import { MissingFileTranslationsHandler } from './services/missing-file-translations.service';

(window as any).jQuery = (window as any).$ = jQuery; // This is needed to resolve issue.

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        DashboardComponent,
        NavigationComponent,
        TitlebarComponent,
        CollectsComponent,
        ReversePipe,
        ISODatePipe,
        PayoutsComponent,
        CollectsShedulerComponent,
        ForgotPasswordComponent,
        UnAuthorizeComponent,
        AssignComponent,
        PayoutComponent,
        FooterComponent,
        AlertComponent,
        LoggedOutComponent,
        SettingsComponent,
        QRCodeComponent,
        GoogleAnalyticsDirective,
        PaginatorComponent
    ],
    imports: [
        AutoCompleteModule,
        NgChartsModule,
        DialogModule,
        DropdownModule,
        FormsModule,
        // ScheduleModule,
        CalendarModule,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        FullCalendarModule,
        TranslateModule.forChild({
          missingTranslationHandler: { provide: MissingTranslationHandler, useClass: MissingFileTranslationsHandler },
          loader: {
            provide: TranslateLoader,
            useFactory: httpClient => new TranslateHttpLoader(httpClient),
            deps: [HttpClient]
          }
        })
    ],
    providers: [
        DataService,
        UserService,
        ApiClientService,
        LoggingService,
        CollectSchedulerService,
        PayoutTranslateResolver,
        OperationsGuard,
        LoggedInGuard,
        LoginComponentGuard,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: BearerTokenInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AcceptHeaderInterceptor,
            multi: true
        },
        {
            provide: LOCALE_ID,
            useValue: 'nl-BE'
        },
        {
            provide: LocationStrategy,
            useClass: HashLocationStrategy
        },
        ISODatePipe
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
