import {CookieMonster} from './helpers/cookiemonster';

export class App {
    static inject () {return [CookieMonster]}

    constructor(cookieMonster){
        this.cookieMonster = cookieMonster;
    }

    configureRouter(config, router){
        config.title = 'Givt Platform';

        if(!this.cookieMonster.getCookie("access_token")){
            config.map([
                {route : '', moduleId: 'login', title: 'Login'}
            ])
        }else{
            config.map([
                {route : '', moduleId: 'dashboard', title: 'Dashboard'},
                {route : 'services', moduleId: 'services', title: 'Diensten',name:'services'}

            ])
        }
        this.router = router;

    }
}
