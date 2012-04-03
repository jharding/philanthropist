/*globals chrome, localStorage, URI */

(function() {
    // module declaration
    var sessionManager = {};

    var kAmazonUrl = 'http://www.amazon.com';
    var kCookieName = 'session-id';
    var kMaxTimeBetweenAffiliatedVisits = 24 * 60 * 60 * 1000; // 24 hours

    var sessionMap = {};

    // empties session map
    sessionManager.clearSessionMap = function() {
        sessionMap = {};
    };

    // updates session's affiliated timestamp in session map
    sessionManager.affiliateSession = function(sessionId) {
        var now = (new Date()).getTime();
        sessionMap[sessionId] = now; 
    };

    // gets passed callback cause of the async nature of the chrome API
    // the arguments passed to the passed in callback are determined
    // by the last affiliated visit within the current session
    sessionManager.isCurrentSessionAffiliated = function(callback) {
        chrome.cookies.get({
            url: kAmazonUrl,
            name: kCookieName
        },
        function(cookie) {
            if (cookie) {
                var sessionId = cookie.value; 
                var now = (new Date()).getTime();
                var lastAffiliatedVisitInSession = sessionMap[sessionId] || 0;
    
                var isAffiliated = (lastAffiliatedVisitInSession + 
                                   kMaxTimeBetweenAffiliatedVisits) > now;
                callback(sessionId, isAffiliated);
            }
        
            // there is no session cookie
            else {
                callback(null, null);
            }
        });
    };

    sessionManager.init = function() {
        // nothing to do for now
    };

    // exposing session manager module
    window.philanthropist = window.philanthropist || {};
    window.philanthropist.sessionManager = sessionManager;
})();
