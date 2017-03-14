import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoggedInGuard } from './guards/logged-in.guard';

import { LoginComponent }   from './components/login.component';
import { NavigationComponent } from "./components/navigation.component";
import {LoginComponentGuard} from "./guards/login.component.guard";
import {DashboardComponent} from "./components/dashboard.component";
import {CollectsComponent} from "./components/collects.component";
import {PayoutsComponent} from "./components/payouts.component";
import {UnAuthorizeComponent} from "./components/unauthorized.component";
import {ForgotPasswordComponent} from "./components/forgotpassword.component";

const routes: Routes = [
    { path: '', component: LoginComponent, pathMatch: 'full', canActivate: [LoginComponentGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [LoggedInGuard] },
    { path: 'login',  component: LoginComponent, canActivate: [LoginComponentGuard] },
    { path: 'forgotpassword',  component: ForgotPasswordComponent, canActivate: [LoginComponentGuard] },
    { path: 'collects', component: CollectsComponent, canActivate: [LoggedInGuard]},
    { path: 'payouts', component: PayoutsComponent, canActivate: [LoggedInGuard]},
    { path: 'unauthorized', component: UnAuthorizeComponent },
    { path: '**', component: LoginComponent, pathMatch: 'full', canActivate: [LoginComponentGuard] }
];
@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
