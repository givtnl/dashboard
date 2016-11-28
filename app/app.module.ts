import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule} from "@angular/http";
import {FormsModule} from "@angular/forms";

import { LoginComponent } from 'app/components/login.component';

import { AppComponent }  from './app.component';
import { AppRoutingModule } from "./app.routing";
import { UserService } from "./Services/user.service";

@NgModule({
    imports:      [ BrowserModule, AppRoutingModule, HttpModule, FormsModule ],
    declarations: [ AppComponent, LoginComponent ],
    bootstrap:    [ AppComponent ],
    providers: [UserService]
})
export class AppModule { }
