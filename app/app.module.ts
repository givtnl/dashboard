import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { LoginComponent } from 'app/components/login.component';

import { AppComponent }  from './app.component';
import {AppRoutingModule} from "./app.routing";

@NgModule({
    imports:      [ BrowserModule, AppRoutingModule ],
    declarations: [ AppComponent, LoginComponent ],
    bootstrap:    [ AppComponent ]
})
export class AppModule { }
