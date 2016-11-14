import {WebApi} from './helpers/webapi';
import {UserManager} from './helpers/UserManager';
import {GoogleCharts} from './helpers/googleCharts';

export class DashBoard {
    static inject() {
        return [WebApi, UserManager]
    }



    constructor(WebApi, userManager) {
        this.webapi = WebApi;
        this.userManager = userManager;
        this.fetchInstanceTitle();
        this.instanceTitle = ".....";
        this.usercount = 0;
        this.monthAmount = 0;
        this.dayAmount = 0;
        this.fetchMonthlyGivts();
        this.fetchDailyGivts();
        this.fetchUsers();
        var d = new Date();
        var month = new Array();
        month[0] = "January";
        month[1] = "February";
        month[2] = "March";
        month[3] = "April";
        month[4] = "May";
        month[5] = "June";
        month[6] = "July";
        month[7] = "August";
        month[8] = "September";
        month[9] = "October";
        month[10] = "November";
        month[11] = "December";
        this.monthText = month[d.getMonth()] + " " + d.getFullYear();
        this.lastSundayDay = this.lastSunday.getUTCDate();
        var that = this;
        setInterval(function(){
            return that.fetchMonthlyGivts();
        },3000);
        setInterval(function(){
            return that.fetchDailyGivts();
        },3000);

        this.chart = new GoogleCharts();
    }

    fetchInstanceTitle(){
        this.webapi.getSecure("OrgAdminView/org")
            .then(function (response){
                this.instanceTitle = response;
            }.bind(this));
    }

    fetchDailyGivts() {
        var date = new Date();
        var day = date.getUTCDay();
        this.lastSunday = new Date(date - day*1000*60*60*24);
        var lastSundayDate = this.lastSunday.getUTCMonth()+1 + "-" + this.lastSunday.getUTCDate() + "-" + this.lastSunday.getUTCFullYear();
        var DateBegin =  lastSundayDate + " 00:00:00";
        var DateEnd = lastSundayDate + " 23:59:59";

        var params = "DateBegin=" + DateBegin + "&DateEnd=" + DateEnd + "&Status=" + "0";
        this.webapi.getSecure("OrgAdminView/Givts/?"+params)
            .then(function (response){
                this.dayAmount = 0;
                for(var prop in response){
                    this.dayAmount = (response[prop].Amount + this.dayAmount);
                }
                this.dayAmount = this.dayAmount.toLocaleString(navigator.language, {minimumFractionDigits: 2});
            }.bind(this));
    }

    fetchMonthlyGivts() {
        var date = new Date();
        var month = date.getUTCMonth()+1;
        var year = date.getFullYear();

        var DateBegin = month + "-01-" + year;
        var DateEnd = month+1 + "-01-" + year;
        var params = "DateBegin=" + DateBegin + "&DateEnd=" + DateEnd + "&Status=" + "0";
        this.webapi.getSecure("OrgAdminView/Givts/?"+params)
            .then(function (response){
                this.monthAmount = 0;
                for(var prop in response){
                    this.monthAmount = response[prop].Amount + this.monthAmount;
                }
                this.monthAmount = this.monthAmount.toLocaleString(navigator.language, {minimumFractionDigits: 2});
            }.bind(this));
    }

    fetchUsers(){
        this.webapi.getSecure("OrgAdminView/Users/")
            .then(function (response) {
                this.usercount = response;
            }.bind(this));
    }

    btnLogOut(){
        console.log("logging out");
        this.userManager.logOut();
    }
}

