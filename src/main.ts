import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { sprintf } from 'sprintf-js';

Date.prototype.toJSON = function () {
    return sprintf("%04i-%02i-%02iT%02i:%02i:%02i.%03i",
        this.getUTCFullYear(), this.getUTCMonth()+1, this.getUTCDate(),
        this.getUTCHours(), this.getUTCMinutes(), this.getUTCSeconds(), this.getUTCMilliseconds()) + "Z";
}

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);

