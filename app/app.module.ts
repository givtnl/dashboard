import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule} from "@angular/http";
import {FormsModule} from "@angular/forms";

import { LoginComponent } from 'app/components/login.component';

import { AppComponent }  from './app.component';
import { AppRoutingModule } from "./app.routing";
import { UserService } from "./services/user.service";
import { NavigationComponent } from "./components/navigation.component";
import {Router} from "@angular/router";
import {LoggedInGuard} from "./guards/logged-in.guard";
import {LoginComponentGuard} from "./guards/login.component.guard";
import {ApiClientService} from "./services/api-client.service";
import {DashboardComponent} from "./components/dashboard.component";

@NgModule({
    imports:      [ BrowserModule, AppRoutingModule, HttpModule, FormsModule, AppRoutingModule ],
    declarations: [ AppComponent, LoginComponent, NavigationComponent, DashboardComponent ],
    bootstrap:    [ AppComponent ],
    providers: [ UserService, ApiClientService, LoggedInGuard, LoginComponentGuard ]
})
export class AppModule { }
