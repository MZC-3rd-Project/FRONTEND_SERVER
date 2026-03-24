/* eslint-disable no-unused-vars */
function startsWithAnyPrefix(value, prefixes) {
    for (var i = 0; i < prefixes.length; i += 1) {
        if (value.indexOf(prefixes[i]) === 0) {
            return true;
        }
    }

    return false;
}

function hasFileExtension(uri) {
    return /\/[^/]+\.[^/]+$/.test(uri);
}

function shouldRewriteToSpaIndex(uri) {
    if (!uri || uri === "/") {
        return false;
    }

    if (hasFileExtension(uri)) {
        return false;
    }

    return !startsWithAnyPrefix(uri, [
        "/api/",
        "/bff/",
        "/oauth2/",
        "/realms/",
        "/resources/",
        "/ws/",
        "/login",
        "/logout",
    ]);
}

function handler(event) {
    var request = event.request;
    var uri = request.uri || "/";

    if (shouldRewriteToSpaIndex(uri)) {
        request.uri = "/index.html";
    }

    return request;
}
