/*globals chrome, URI */

(function() {
    // module declaration
    var sessionManager = {};

    var kAmazonUrl = 'http://www.amazon.com';
    var kCookieName = 'session-id';
    var kMaxTimeBetweenAssociatedVisits = 24 * 60 * 60 * 1000; // 24 hours

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

    // updates session's associated timestamp in session map
    sessionManager.associateSession = function(sessionId, associateId) {
        var now = (new Date()).getTime();
        sessionMap[sessionId] = {
            lastAssociatedVisit: now,
            associateId: associateId
        }; 
    };

    // gets passed callback cause of the async nature of the chrome API
    // the arguments passed to the passed in callback are determined
    // by the last associated visit within the current session
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
                        lastAssociatedVisit: 0,
                        associateId: null
                    };
                }
    
                var now = (new Date()).getTime();
                var isAssociated = (session.lastAssociatedVisit + 
                                   kMaxTimeBetweenAssociatedVisits) > now;

                // call the callback, passing the session object for
                // the current session
                callback({
                    id: sessionId,
                    isAssociated: isAssociated,
                    lastAssociatedVisit: session.lastAssociatedVisit,
                    associateId: session.associateId 
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
