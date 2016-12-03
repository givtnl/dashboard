"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
require('rxjs/add/operator/toPromise'); //to support toPromise
var user_1 = require('../models/user');
var UserService = (function () {
    function UserService(http) {
        this.http = http;
        //this has to become environment variable in story 2461
        this.apiUrl = 'https://givtapidebug.azurewebsites.net/oauth2/token';
        this.loggedIn = false;
        this.user = new user_1.User();
        if (localStorage.getItem('access_token'))
            this.loggedIn = !!localStorage.getItem('access_token');
        else if (sessionStorage.getItem('access_token'))
            this.loggedIn = !!sessionStorage.getItem('access_token');
        console.log(this.loggedIn);
    }
    UserService.prototype.login = function (username, password, stayloggedin) {
        var _this = this;
        if (stayloggedin === void 0) { stayloggedin = false; }
        //Set the headers
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        //set the x-www-form-urlencoded parameters
        var urlSearchParams = new http_1.URLSearchParams();
        urlSearchParams.append('grant_type', 'password');
        urlSearchParams.append('userName', username);
        urlSearchParams.append('password', password);
        //set to string
        var body = urlSearchParams.toString();
        //do the http call
        return this.http
            .post(this.apiUrl, body, { headers: headers })
            .toPromise()
            .then(function (res) {
            if (res.json().access_token) {
                _this.loggedIn = true;
                if (stayloggedin) {
                    localStorage.setItem('access_token', res.json().access_token);
                }
                else {
                    sessionStorage.setItem('access_token', res.json().access_token);
                }
                return true;
            }
            else {
                return false;
            }
        });
    };
    UserService.prototype.logout = function () {
        sessionStorage.clear();
        localStorage.clear();
        this.loggedIn = false;
    };
    UserService.prototype.getAccessToken = function () {
        return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    };
    UserService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], UserService);
    return UserService;
}());
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map