/*globals chrome: true, module, ok, strictEqual, test, URI */

(function() {
    var sessionId = 'sessionId';
    var cookie = {
        value: sessionId
    };

    var stubChromeAPI = function() {
        chrome = {};
        chrome.cookies = {};
        chrome.cookies.get = function(options, callback) {
            callback(cookie);
        };

    };

    $(document).ready(function() {
        // get local reference to listener
        var sessionManager = window.philanthropist.sessionManager;
        sessionManager.init();

        module('Background Session Manager', {
            setup: function() {
                sessionManager.clearSessionMap();
                stubChromeAPI();
            }
        });

        test('first visit in session', function() {
            sessionManager.isCurrentSessionAffiliated(function(sessionId, isAffiliated) {
                ok(!isAffiliated);
            });
        });

        test('visit after session is affiliated', function() {
            sessionManager.affiliateSession(sessionId);
            sessionManager.isCurrentSessionAffiliated(function(sessionId, isAffiliated) {
                ok(isAffiliated);
            });
        });
    });
})();
