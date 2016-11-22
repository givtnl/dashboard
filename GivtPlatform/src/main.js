import environment from './environment';
import Backend from 'i18next-xhr-backend';

//Configure Bluebird Promises.
//Note: You may want to use environment-specific configuration.
Promise.config({
  warnings: {
    wForgottenReturn: false
  }
});

export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature('resources');

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin('aurelia-testing');
  }

  aurelia.use.plugin('aurelia-i18n', (instance) => {
    // register backend plugin
    instance.i18next.use(Backend);

    return instance.setup({
      backend: {
        loadPath: './locales/{{lng}}/{{ns}}.json',
      },
      lng : navigator.language.substring(0,2),
      attributes : ['t','i18n'],
      fallbackLng : 'nl',
      debug : false
    });
  });

  aurelia.start().then(() => aurelia.setRoot());
}
