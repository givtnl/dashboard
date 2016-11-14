export class App {

    constructor(){
    }

    configureRouter(config, router){
        config.title = 'Givt Platform';
        if(!localStorage.access_token && !sessionStorage.access_token){
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
