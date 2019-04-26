import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {LoginComponent} from './components/login.component';
import {LoginComponentGuard} from "./guards/login.component.guard";
import {DashboardComponent} from "./components/dashboard.component";
import {LoggedInGuard} from "./guards/logged-in.guard";
import {CollectsComponent} from "./components/collects.component";
import {PayoutsComponent} from "./components/payouts.component";
import {AssignComponent} from "./components/assign.component";
import {ForgotPasswordComponent} from "./components/forgotpassword.component";
import {UnAuthorizeComponent} from "./components/unauthorized.component";
import {LoggedOutComponent} from 'app/components/loggedout.component';
import {PartyComponent} from "./components/party.component";
import {SettingsComponent} from "./components/settings.component";
import {TerminateComponent} from './components/terminate.component';
import { QRCodeComponent } from './components/qrcode.component';

const routes: Routes = [
    {path: '', component: LoginComponent, pathMatch: 'full', canActivate: [LoginComponentGuard]},
    {path: 'dashboard', component: DashboardComponent, canActivate: [LoggedInGuard]},
    {path: 'login', component: LoginComponent, canActivate: [LoginComponentGuard]},
    {path: 'collects', component: CollectsComponent, canActivate: [LoggedInGuard]},
    {path: 'payouts', component: PayoutsComponent, canActivate: [LoggedInGuard]},
    {path: 'assign', component: AssignComponent, canActivate: [LoggedInGuard]},
    {path: 'party', component: PartyComponent, canActivate: [LoggedInGuard]},
    {path: 'settings', component: SettingsComponent, canActivate: [LoggedInGuard]},
    {path: 'forgotpassword', component: ForgotPasswordComponent, canActivate: [LoginComponentGuard]},
    {path: 'unauthorized', component: UnAuthorizeComponent},
    {path: 'loggedout', component: LoggedOutComponent},
    {path: 'terminate', component: TerminateComponent},
    {path: 'qr-code', component: QRCodeComponent},
    {path: '**', component: LoginComponent, pathMatch: 'full', canActivate: [LoginComponentGuard]}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
