window.dataLayer = window.dataLayer || [];

function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());

gtag('config', 'UA-114097637-2');

var quote = document.getElementById("quote");
var disclaimer = document.getElementById("disclaimer");

var lang = navigator.language;

if (quote !== undefined && disclaimer !== undefined) {
    if (lang.indexOf("nl") !== -1) {
        quote.innerText = "Een ogenblik geduld alsjeblieft...";
        disclaimer.innerText = "Gelieve een andere browser dan Internet Explorer te gebruiken.";
    } else {
        quote.innerText = "We'll be with you in a second...";
        disclaimer.innerText = "Please use another browser (e.g. Chrome, FireFox, Safari, ...)"
    }

}

var version = detectIE();

if (version === false) {
    document.getElementById('ie-disclaimer').setAttribute("style", "display: none;");
} else if (version >= 12) {
    document.getElementById('ie-disclaimer').setAttribute("style", "display: none;");
} else {
    document.getElementById('ie-disclaimer').setAttribute("style", "display: block; font: 18px Verdana, sans-serif;");
}

function detectIE() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // Edge (IE 12+) => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}