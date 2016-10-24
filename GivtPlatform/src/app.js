export class App {
    configureRouter(config, router){
        config.title = 'Givt Platform';
            config.map([
              {route : '', moduleId: 'login', title: 'Login'}
        ])
    }
}
