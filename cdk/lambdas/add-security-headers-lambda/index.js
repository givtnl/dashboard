'use strict';
exports.handler = (event, context, callback) => {

    //Get contents of response
    const response = event.Records[0].cf.response;
    const headers = response.headers;

    //Set new headers 
    headers['permissions-policy'] = [{ key: 'Permissions-Policy', value: `fullscreen=(self);` }]
    headers['strict-transport-security'] = [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubdomains; preload' }];
    headers['content-security-policy'] = [{ key: 'Content-Security-Policy', value: "connect-src 'self' api.logit.io apidebug.givtapp.net api.givtapp.net www.google-analytics.com; default-src 'none';font-src 'self' use.fontawesome.com cdnjs.cloudflare.com; img-src 'self' www.google-analytics.com; script-src  www.gstatic.com www.googletagmanager.com www.google-analytics.com 'unsafe-eval' 'self'; style-src 'unsafe-inline' 'self' use.fontawesome.com cdnjs.cloudflare.com; object-src 'none';" }];
    headers['x-content-type-options'] = [{ key: 'X-Content-Type-Options', value: 'nosniff' }];
    headers['x-frame-options'] = [{ key: 'X-Frame-Options', value: 'DENY' }];
    headers['x-xss-protection'] = [{ key: 'X-XSS-Protection', value: '1; mode=block' }];
    headers['referrer-policy'] = [{ key: 'Referrer-Policy', value: 'same-origin' }];

    //Return modified response
    callback(null, response);
};