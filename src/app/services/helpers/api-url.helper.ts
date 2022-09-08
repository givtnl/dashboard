import { environment } from '../../../environments/environment';

export function getApiUrl(): string {
    /**
     * Based on the hostname, the backend is set for eu (givtapp.net) or us (givt.app)
     * For local dev apiUrl remains used
     */
    if(environment.production) {
        if(window.location.hostname.endsWith('givt.app'))
            return environment.apiUrlUS;
        else
            return environment.apiUrlEU;
    }

    if (window.location.hostname.endsWith('givt.app'))
        return environment.apiUrlUS;
    else if (window.location.hostname.endsWith('givtapp.net'))
        return environment.apiUrlEU;
    else 
        return environment.apiUrl;
}