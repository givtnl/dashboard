import {WebApi} from './helpers/webapi';


export class DashBoard {
    static inject() {
        return [WebApi]
    }



    constructor(WebApi) {
        this.webapi = WebApi;

        this.usercount = 0;
        this.monthAmount = 0;
        this.dayAmount = 0;
        this.fetchMonthlyGivts();
        this.fetchDailyGivts();
        this.fetchUsers();

     //   setInterval(function(){
      //      this.fetchGivts();
    //      }.bind(this),3000);
    }

    fetchDailyGivts() {
        var date = new Date();
        var day = date.getUTCDay();
        //var lastsunday = date.getUTCDate();
        var lastSunday = new Date(date - day*1000*60*60*24);
        var lastSundayDate = lastSunday.getUTCMonth()+1 + "-" + lastSunday.getUTCDate() + "-" + lastSunday.getUTCFullYear();
        var DateBegin =  lastSundayDate + " 00:00:00";
        var DateEnd = lastSundayDate + " 23:59:59";

        var params = "DateBegin=" + DateBegin + "&DateEnd=" + DateEnd + "&Status=" + "0";
        console.log(params);
        this.webapi.getSecure("OrgAdminView/Givts/?"+params)
            .then(function (response){
                this.dayAmount = 0;
                for(var prop in response){
                    this.dayAmount = response[prop].Amount + this.dayAmount;
                }
                //this.dayAmount = this.dayAmount.toFixed(2);
            }.bind(this));
    }

    fetchMonthlyGivts() {
        /* TODO
            - Givts van deze maand
            - Givts van deze dag
            - Op bedragen rek. houden met CultureInfo!

         */

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
                this.monthAmount = this.monthAmount.toFixed(2);
            }.bind(this));
    }

    fetchUsers(){
        /* TODO

         - Unieke gevers van deze maand
         - Unieke gevers van deze dag
         */

        this.webapi.getSecure("OrgAdminView/Users/")
            .then(function (response) {
                this.usercount = response;
            }.bind(this));
    }
}

