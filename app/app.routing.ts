import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoggedInGuard } from './guards/logged-in.guard';

import { LoginComponent }   from './components/login.component';
import { NavigationComponent } from "./components/navigation.component";
import {LoginComponentGuard} from "./guards/login.component.guard";
import {DashboardComponent} from "./components/dashboard.component";

const routes: Routes = [
    { path: '', component: LoginComponent, pathMatch: 'full', canActivate: [LoginComponentGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [LoggedInGuard] },
    { path: 'login',  component: LoginComponent, canActivate: [LoginComponentGuard] },
    { path: '**', component: LoginComponent, pathMatch: 'full', canActivate: [LoginComponentGuard] }
];
@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
