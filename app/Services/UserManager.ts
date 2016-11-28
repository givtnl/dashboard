import { Injectable } from '@angular/core';

import { User } from '../models/user';

@Injectable()
export class UserManagerService {

    user: User = new User();

    updateUser(user: User): void {
        this.user = user;
        console.log("user updated");
        console.log(user);
        //this.apiService.addUser(this.user);
    }

    getUser() : User{
        if(this.user.UserId)
            return this.user;
        return;
    }
}