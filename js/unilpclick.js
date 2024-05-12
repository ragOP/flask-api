function parseBool(value, defaultValue) {
    return (value == 'true' || value == 'false' || value === true || value === false) && JSON.parse(value) || defaultValue;
}

var campaignIds = {
    'default': "65b654217df6cd000103c5c3",
}
var cookieDomain = ""
var cookieDuration = parseInt("90") || 30
var registerViewOncePerSession = parseBool("false", false)
var lastPaidClickAttribution = false
var firstClickAttribution = false
var attribution = "lastpaid"
let referrer = document.referrer;
if (attribution === 'lastpaid') {
    lastPaidClickAttribution = true
} else if (attribution === 'firstclick') {
    lastPaidClickAttribution = false
    firstClickAttribution = true
} else if (attribution === 'lastclick') {
    lastPaidClickAttribution = false
    firstClickAttribution = false
}

var ourCookie = getCookie('rtkclickid-store')

function removeParam(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param, params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
};

function stripTrailingSlash(str) {
    return str.replace(/\/$/, "");
}

var urlParams = new URLSearchParams(window.location.search);
var locSearch = window.location.search
locSearch = locSearch.substring(1)
var rtkfbp = getCookie('_fbp');
var rtkfbc = getCookie('_fbc');
var pixelParams = "&" + locSearch + "&sub19=" + rtkfbp + "&sub20=" + rtkfbc
var campaignID = urlParams.get('cmpid')
if (!campaignID) {
    campaignID = campaignIds['default']
}
var initialSrc = "https://redireoct.com/" + campaignID + "?format=json" + "&referrer=" + referrer;
for (var i = 1; i <= 10; i++) {
    initialSrc = removeParam("sub" + i, initialSrc)
}
var rawData;
initialSrc = removeParam("cost", initialSrc);
initialSrc = removeParam("ref_id", initialSrc);

function checkIsExistAndSet(clickID) {
    if (ourCookie === null || ourCookie === undefined || ourCookie === 'undefined' || !firstClickAttribution) {
        setCookie(clickID);
    }
}

function getSessionRegisterViewOncePerSession() {
    return Number(sessionStorage.getItem('viewOnce'))
}

function setSessionRegisterViewOncePerSession() {
    sessionStorage.setItem('viewOnce', '1')
}

function getSessionClickID() {
    return sessionStorage.getItem('rtkclickid')
}

function setSessionClickID(clickID = '') {
    sessionStorage.setItem('rtkclickid', clickID);
}

function setCookie(clickID = '') {
    var cookieName = "rtkclickid-store",
        cookieValue = clickID,
        expirationTime = 86400 * cookieDuration * 1000,
        date = new Date(),
        dateTimeNow = date.getTime();
    date.setTime(dateTimeNow + expirationTime);
    var date = date.toUTCString();
    document.cookie = cookieName + "=" + cookieValue + "; expires=" + date + "; path=/; domain=" + cookieDomain
}

function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length === 2) {
        return parts.pop().split(";").shift();
    }
}

function setHref(clickID, ref) {
    document.querySelectorAll('a').forEach(function (el) {
        if (el.href.indexOf("https://redireoct.com/click") > -1) {
            if (el.href.indexOf('?') > -1) {
                el.href = stripTrailingSlash(el.href) + "&clickid=" + clickID + "&referrer=" + ref
            } else {
                el.href = stripTrailingSlash(el.href) + "?clickid=" + clickID + "&referrer=" + ref
            }
        }
    });
}

function xhrrOpenAndSend(clickID, ref) {
    let xhrr = new XMLHttpRequest;
    if (getSessionRegisterViewOncePerSession() !== 1) {
        xhrr.open("GET", "https://redireoct.com/view?clickid=" + clickID + "&referrer=" + ref)
        xhrr.send();
    }
    if (registerViewOncePerSession) {
        setSessionRegisterViewOncePerSession()
    }
}

if (!urlParams.get('rtkcid')) {
    rtkxhr = new XMLHttpRequest;
    let rtkClickID
    rtkxhr.onreadystatechange = function () {
        if (rtkxhr.readyState === 4 && rtkxhr.status === 200) {
            rawData = JSON.parse(rtkxhr.responseText);
            rtkClickID = rawData.clickid;
            setSessionClickID(rtkClickID);
            checkIsExistAndSet(rtkClickID)
            setHref(rtkClickID, referrer)
            xhrrOpenAndSend(rtkClickID, referrer)
        }
    }
    if (!getSessionClickID()) {
        rtkxhr.open("GET", initialSrc + pixelParams);
        rtkxhr.send();
    } else {
        rtkClickID = getSessionClickID()
        checkIsExistAndSet(rtkClickID)
        setHref(rtkClickID, referrer)
        xhrrOpenAndSend(rtkClickID, referrer)
    }
} else {
    let rtkClickID = urlParams.get('rtkcid')
    checkIsExistAndSet(rtkClickID)
    xhrrOpenAndSend(rtkClickID, referrer)
    setHref(rtkClickID, referrer)
    setSessionClickID(rtkClickID)
}
