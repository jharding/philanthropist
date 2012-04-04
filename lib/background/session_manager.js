/*globals chrome, URI */

(function() {
    // module declaration
    var sessionManager = {};

    var kAmazonUrl = 'http://www.amazon.com';
    var kCookieName = 'session-id';
    var kMaxTimeBetweenAffiliatedVisits = 24 * 60 * 60 * 1000; // 24 hours

    var currentSessionId = null;
    var sessionMap = {};

    // empties session map
    sessionManager.clearSessionMap = function() {
        sessionMap = {};
    };

    // returns the current session object
    sessionManager.getCurrentSession = function() {
        return sessionMap[currentSessionId];    
    };

    // updates session's affiliated timestamp in session map
    sessionManager.affiliateSession = function(sessionId, affiliateId) {
        var now = (new Date()).getTime();
        sessionMap[sessionId] = {
            lastAffiliatedVisit: now,
            affiliateId: affiliateId
        }; 
    };

    // gets passed callback cause of the async nature of the chrome API
    // the arguments passed to the passed in callback are determined
    // by the last affiliated visit within the current session
    sessionManager.registerCurrentSession = function(callback) {
        chrome.cookies.get({
            url: kAmazonUrl,
            name: kCookieName
        },
        function(cookie) {
            if (cookie) {
                currentSessionId = cookie.value;
                var sessionId = currentSessionId;
                var session = sessionMap[sessionId];
                if (!session) {
                    session = sessionMap[sessionId] = {
                        lastAffiliatedVisit: 0,
                        affiliateId: null
                    };
                }
    
                var now = (new Date()).getTime();
                var isAffiliated = (session.lastAffiliatedVisit + 
                                   kMaxTimeBetweenAffiliatedVisits) > now;

                // call the callback, passing the session object for
                // the current session
                callback({
                    id: sessionId,
                    isAffiliated: isAffiliated,
                    lastAffiliatedVisit: session.lastAffiliatedVisit,
                    affiliateId: session.affiliateId 
                });
            }
        
            // no cookie means no session
            else {
                callback(null);
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
