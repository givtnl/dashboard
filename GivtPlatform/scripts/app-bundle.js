define('app',['exports', './helpers/cookiemonster'], function (exports, _cookiemonster) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.App = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var App = exports.App = function () {
        App.inject = function inject() {
            return [_cookiemonster.CookieMonster];
        };

        function App(cookieMonster) {
            _classCallCheck(this, App);

            this.cookieMonster = cookieMonster;
        }

        App.prototype.configureRouter = function configureRouter(config, router) {
            config.title = 'Givt Platform';

            if (!this.cookieMonster.getCookie("access_token")) {
                config.map([{ route: '', moduleId: 'login', title: 'Login' }]);
            } else {
                config.map([{ route: '', moduleId: 'dashboard', title: 'Dashboard' }]);
            }
        };

        return App;
    }();
});
define('dashboard',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var DashBoard = exports.DashBoard = function DashBoard() {
        _classCallCheck(this, DashBoard);

        this.message = "Hello World";
    };
});
define('environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('login',['exports', './helpers/webapi', 'aurelia-event-aggregator', './helpers/messages', './helpers/cookiemonster'], function (exports, _webapi, _aureliaEventAggregator, _messages, _cookiemonster) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Login = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var Login = exports.Login = function () {
        Login.inject = function inject() {
            return [_webapi.WebApi, _aureliaEventAggregator.EventAggregator, _cookiemonster.CookieMonster];
        };

        function Login(api, ea, cookieMonster) {
            var _this = this;

            _classCallCheck(this, Login);

            this.stayLoggedIn = "Blijf ingelogd";
            this.api = api;
            this.email = "debug@nfcollect.com";
            this.password = "Test123";
            this.staylogged = false;
            this.legit = false;
            this.ea = ea;
            this.cookieMonster = cookieMonster;

            ea.subscribe(_messages.LoginEvent, function (msg) {
                _this.loggedIn(msg.msg);
            });
        }

        Login.prototype.loggedIn = function loggedIn(msg) {
            this.cookieMonster.createCookie("access_token", msg.access_token, msg.expires_in / 60 / 60 / 24);
            console.log(msg);
            location.reload();
        };

        Login.prototype.login = function login() {
            this.api.login(this.email, this.password);
        };

        return Login;
    }();
});
define('main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  Promise.config({
    warnings: {
      wForgottenReturn: false
    }
  });

  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('helpers/cookiemonster',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var CookieMonster = exports.CookieMonster = function () {
        function CookieMonster() {
            _classCallCheck(this, CookieMonster);

            this.createCookie = function (name, value, days) {
                var expires;
                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
                    expires = "; expires=" + date.toGMTString();
                } else {
                    expires = "";
                }
                document.cookie = name + "=" + value + expires + "; path=/";
            };
        }

        CookieMonster.prototype.getCookie = function getCookie(c_name) {
            if (document.cookie.length > 0) {
                var c_start = document.cookie.indexOf(c_name + "=");
                if (c_start != -1) {
                    c_start = c_start + c_name.length + 1;
                    var c_end = document.cookie.indexOf(";", c_start);
                    if (c_end == -1) {
                        c_end = document.cookie.length;
                    }
                    console.log(document.cookie.substring(c_start, c_end));
                    return unescape(document.cookie.substring(c_start, c_end));
                }
            }
            return "";
        };

        return CookieMonster;
    }();
});
define('helpers/messages',["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var LoginEvent = exports.LoginEvent = function LoginEvent(msg) {
        _classCallCheck(this, LoginEvent);

        this.msg = msg;
    };
});
define('helpers/webapi',['exports', 'aurelia-event-aggregator', './messages'], function (exports, _aureliaEventAggregator, _messages) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.WebApi = undefined;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var WebApi = exports.WebApi = function () {
        WebApi.inject = function inject() {
            return [_aureliaEventAggregator.EventAggregator];
        };

        function WebApi(ea) {
            _classCallCheck(this, WebApi);

            this.ea = ea;
        }

        WebApi.prototype.get = function get(url, params) {
            var oReq = new XMLHttpRequest();
            oReq.open("POST", "https://givtapidebug.azurewebsites.net/api/" + url);
            oReq.setRequestHeader("Content-type", "application/json");
            var params = JSON.parse(params);
            oReq.onreadystatechange = function () {
                if (oReq.readyState == 4 && oReq.status == 200) {
                    return JSON.parse(oReq.responseText);
                }
            };
            oReq.send(params);
        };

        WebApi.prototype.login = function login(email, password) {
            var oReq = new XMLHttpRequest();
            var eventAggr = this.ea;
            oReq.open("POST", "https://givtapidebug.azurewebsites.net/oauth2/token");
            oReq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            var params = "grant_type=password&userName=" + email + "&password=" + password;
            oReq.send(params);
            oReq.onload = function () {
                if (oReq.status >= 200 && oReq.status < 300) {
                    var json = oReq.responseText;
                    if (json != "") {
                        eventAggr.publish(new _messages.LoginEvent(JSON.parse(json)));
                    }
                } else {
                    return this.statusText;
                }
            };
        };

        return WebApi;
    }();
});
define('resources/index',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {}
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\n    <require from=\"./css/style.css\"></require>\n    <router-view class=\"main\"></router-view>\n</template>"; });
define('text!css/login.css', ['module'], function(module) { module.exports = "*,body,html{\n    padding:0;\n    margin: 0;\n    list-style-type: none;\n    font-size: 16px;\n    font-family: sans-serif;\n    -webkit-box-sizing: border-box;\n    -moz-box-sizing: border-box;\n    box-sizing: border-box;\n    background: #F5F5F5;\n}\n@font-face {\n    font-family: 'Avenir LT Std 85 Heavy';\n    font-style: normal;\n    font-weight: normal;\n    src: local('Avenir LT Std 85 Heavy'), url('../fonts/AvenirLTStd-Heavy.woff') format('woff');\n}\n\n@font-face {\n    font-family: 'Avenir LT Std 65 Medium';\n    font-style: normal;\n    font-weight: normal;\n    src: local('Avenir LT Std 65 Medium'), url('../fonts/AvenirLTStd-Medium.woff') format('woff');\n}\n\n@font-face {\n    font-family: 'Avenir LT Std 35 Light';\n    font-style: normal;\n    font-weight: normal;\n    src: local('Avenir LT Std 35 Light'), url('../fonts/AvenirLTStd-Light.woff') format('woff');\n}\n\nmain{\n    width: 100%;\n    font-size: 2em;\n    max-width: 500px;\n    margin: 0 auto;\n}\n\nsection{\n    width: 100%;\n    padding:27px;\n\n}\n\n.login{\n    background: #FFFFFF;\n    border: 1px solid #E3E2E7;\n    border-radius: 2px;\n    margin:1em;\n    -webkit-box-sizing: border-box;\n    -moz-box-sizing: border-box;\n    box-sizing: border-box;\n    width: auto;\n}\n\n.logo{\n    margin: 2em auto;\n    display: block;\n    height:7em;\n    width: auto;\n    padding:1.5em;\n}\n\nbutton{\n    background: #41C98E;\n    border: 1px solid #41C98E;\n    font-family: Avenir-Heavy;\n    font-size: 1em;\n    color: #FFFFFF;\n    text-align: center;\n    padding:10px 0;\n\n}\nform{\n    background:white;\n}\n.block{\n    display: block;\n}\ninput[type=\"checkbox\"]{\n    /* Rectangle 5: */\n    background: #FFFFFF;\n    border: 1px solid #2C2B57;\n    -webkit-border-radius:0;\n    -moz-border-radius:0;\n    border-radius:0;\n    font-size: x-large;\n}\n\ninput[required]{\n    padding: 10px 0 10px 13px;\n    background-color:white;\n\n}\n\ninput{\n    border:1px solid #E0E0E6;\n    margin-bottom: 26px;\n    font-family: Avenir-Light;\n    color:#2E2957;\n    font-size: 1em;\n    border-radius: 0;\n    box-shadow: none !important;\n\n}\n\ninput::-webkit-input-placeholder { /* WebKit, Blink, Edge */\n    color:    #e0e0e6;\n}\ninput:-moz-placeholder { /* Mozilla Firefox 4 to 18 */\n    color:    #e0e0e6;\n    opacity:  1;\n}\ninput::-moz-placeholder { /* Mozilla Firefox 19+ */\n    color:    #e0e0e6;\n    opacity:  1;\n}\ninput:-ms-input-placeholder { /* Internet Explorer 10-11 */\n    color:    #e0e0e6;\n}\n\nlabel{\n    background-color:white;\n    margin-left: 15px;\n    color: #e0e0e6;\n    opacity:1;\n    font-family: Avenir-Light;\n    font-size: 1em;\n\n\n}\n\ninput[type=checkbox]:checked + label{\n    color:#2E2957;\n}\ninput[type=\"email\"], input[type=\"password\"]{\n    -webkit-appearance: none;\n}\n\n.input-full-width{\n    width:100%;\n}\n\n\n"; });
define('text!dashboard.html', ['module'], function(module) { module.exports = "<template>\n    <h1>${message}</h1>\n</template>"; });
define('text!css/style.css', ['module'], function(module) { module.exports = "/* #### Generated By: http://www.cufonfonts.com #### */\n\n@import url(\"https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css\");\n.search { position: relative; display: flex;height: 50px;align-self: center;}\n.search input { align-self: center; text-indent: 30px;}\n.search .fa-search {\n  position: absolute;\n  top:15px;\n  left: 7px;\n  font-size: 20px;\n  color:#BDBDBD;\n}\n\n@font-face {\nfont-family: 'Avenir LT Std 95 Black';\nfont-style: normal;\nfont-weight: normal;\nsrc: local('Avenir LT Std 95 Black'), url('../fonts/AvenirLTStd-Black.woff') format('woff');\n}\n\n\n@font-face {\nfont-family: 'Avenir LT Std 45 Book';\nfont-style: normal;\nfont-weight: normal;\nsrc: local('Avenir LT Std 45 Book'), url('../fonts/AvenirLTStd-Book.woff') format('woff');\n}\n\n\n@font-face {\nfont-family: 'Avenir LT Std 85 Heavy';\nfont-style: normal;\nfont-weight: normal;\nsrc: local('Avenir LT Std 85 Heavy'), url('../fonts/AvenirLTStd-Heavy.woff') format('woff');\n}\n\n\n@font-face {\nfont-family: 'Avenir LT Std 35 Light';\nfont-style: normal;\nfont-weight: normal;\nsrc: local('Avenir LT Std 35 Light'), url('../fonts/AvenirLTStd-Light.woff') format('woff');\n}\n\n\n@font-face {\nfont-family: 'Avenir LT Std 65 Medium';\nfont-style: normal;\nfont-weight: normal;\nsrc: local('Avenir LT Std 65 Medium'), url('../fonts/AvenirLTStd-Medium.woff') format('woff');\n}\n\n\n@font-face {\nfont-family: 'Avenir LT Std 55 Roman';\nfont-style: normal;\nfont-weight: normal;\nsrc: local('Avenir LT Std 55 Roman'), url('../fonts/AvenirLTStd-Roman.woff') format('woff');\n}\n\n\n@font-face {\nfont-family: 'Avenir LT Std 95 Black Oblique';\nfont-style: normal;\nfont-weight: normal;\nsrc: local('Avenir LT Std 95 Black Oblique'), url('../fonts/AvenirLTStd-BlackOblique.woff') format('woff');\n}\n\n\n@font-face {\nfont-family: 'Avenir LT Std 45 Book Oblique';\nfont-style: normal;\nfont-weight: normal;\nsrc: local('Avenir LT Std 45 Book Oblique'), url('../fonts/AvenirLTStd-BookOblique.woff') format('woff');\n}\n\n\n@font-face {\nfont-family: 'Avenir LT Std 85 Heavy Oblique';\nfont-style: normal;\nfont-weight: normal;\nsrc: local('Avenir LT Std 85 Heavy Oblique'), url('../fonts/AvenirLTStd-HeavyOblique.woff') format('woff');\n}\n\n\n@font-face {\nfont-family: 'Avenir LT Std 35 Light Oblique';\nfont-style: normal;\nfont-weight: normal;\nsrc: local('Avenir LT Std 35 Light Oblique'), url('../fonts/AvenirLTStd-LightOblique.woff') format('woff');\n}\n\n\n@font-face {\nfont-family: 'Avenir LT Std 65 Medium Oblique';\nfont-style: normal;\nfont-weight: normal;\nsrc: local('Avenir LT Std 65 Medium Oblique'), url('../fonts/AvenirLTStd-MediumOblique.woff') format('woff');\n}\n\n\n@font-face {\nfont-family: 'Avenir LT Std 55 Oblique';\nfont-style: normal;\nfont-weight: normal;\nsrc: local('Avenir LT Std 55 Oblique'), url('../fonts/AvenirLTStd-Oblique.woff') format('woff');\n}\n\n"; });
define('text!login.html', ['module'], function(module) { module.exports = "<template>\n    <main>\n\n    <require from=\"./css/login.css\"></require>\n    <svg class=\"logo\" viewBox=\"654 217 135 53\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n        <g id=\"Group\" stroke=\"none\" stroke-width=\"1\" fill=\"none\" fill-rule=\"evenodd\" transform=\"translate(654.000000, 217.000000)\">\n            <rect id=\"Rectangle-1-Copy-2\" fill=\"#41C98E\" x=\"48.7696335\" y=\"0\" width=\"55.8376963\" height=\"7.92119565\"></rect>\n            <path d=\"M33.9267016,25.2038043 L44.5287958,25.2038043 L44.5287958,42.8091174 C39.6357755,48.3548784 33.5677321,51.1277174 24.91085,51.1277174 C17.665416,51.1277174 10.7888043,47.7562679 6.33537253,42.8091165 C1.88194075,37.861965 3.14732715e-16,31.3320422 0,25.3472285 C3.1121944e-16,19.3624148 2.13300314,12.533203 7.14364416,7.5611413 C12.1542852,2.58907964 17.865371,0 24.946136,0 C32.026901,0 38.1783704,2.36647462 44.5287958,7.5611413 L37.576866,15.7889457 C36.8296594,14.7828875 32.9532899,10.0815217 25.4450262,10.0815217 C21.8783809,10.0815217 18.2103674,11.3745765 15.3404228,14.2669777 C12.4704782,17.159379 10.6840603,20.6142076 10.6840603,25.3472278 C10.6840603,30.080248 12.4723009,33.9613176 15.1326604,36.5585261 C17.7930199,39.1557345 21.5855464,41.016317 24.6285618,41.0163156 C28.6829444,41.0163138 31.6151826,40.2752983 33.9267016,38.8858696 L33.9267016,25.2038043 Z\" id=\"Path-Copy\" fill=\"#2E2957\"></path>\n            <polygon id=\"Path-Copy-2\" fill=\"#2E2957\" points=\"59.3717277 51.1277174 48.7696335 51.1277174 48.7696335 12.2418478 59.3717277 12.2418478\"></polygon>\n            <path d=\"M119.451286,20.1630435 L119.451286,36.7255435 C119.451286,36.7255435 119.986395,41.7162815 124.752333,41.7663043 C127.096877,41.7909124 128.639767,40.1993295 129.235154,39.3683174 C129.701529,40.1993295 134.94546,44.5097849 134.94546,44.5097849 C132.152575,48.1120864 127.290001,50.9475144 122.342034,51.1277174 C118.495492,51.2678069 115.347945,49.8632256 112.731258,47.334204 C110.11457,44.8051824 108.806246,41.3588223 108.849191,36.7255435 L108.849191,0 L119.451286,0 L119.451286,12.2418478 L128.639767,12.2418478 L128.639767,20.1630435 L119.451286,20.1630435 Z\" id=\"Path-Copy-4\" fill=\"#2E2957\"></path>\n            <polygon id=\"Givt\" fill=\"#2E2957\" points=\"79.091623 51.1277174 64.0366492 12.2418478 75.6282733 12.2418478 84.5340314 36.7255435 94.0052356 12.2418478 105.031414 12.2418478 89.9764398 51.1277174\"></polygon>\n        </g>\n    </svg>\n    <section class=\"white-bg login\">\n        <!-- login formulier -->\n        <form action=\"\">\n\n            <input class=\"block input-full-width\" value.bind=\"email\" type=\"email\" placeholder=\"E-mailadres\" required>\n            <input class=\"block input-full-width\" value.bind=\"password\" type=\"password\" placeholder=\"Wachtwoord\" required>\n            <input type=\"checkbox\" id=\"stay-loggedin\" checked.bind=\"staylogged\"> <label for=\"stay-loggedin\">${stayLoggedIn}</label>\n            <button class=\"block input-full-width\" type=\"button\" click.delegate=\"login()\">Inloggen</button>\n        </form>\n    </section>\n    <section>\n        <!-- Registreer / ww vergeten -->\n    </section>\n    </main>\n\n</template>"; });
//# sourceMappingURL=app-bundle.js.map