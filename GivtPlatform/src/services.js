/**
 * Created by lenniestockman on 02/11/16.
 */
import {UserManager} from './helpers/UserManager';


export class services{
    static inject() {
        return [UserManager]
    }
    constructor(userManager){
        this.message = "Hello World";
        this.um = userManager;
    }

    btnLogOut(){
        this.um.logOut();
    }
}