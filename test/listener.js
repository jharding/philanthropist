/*globals chrome: true, module, ok, strictEqual, test, URI */

(function() {
    var _sessionManager = null;

    // stubs out the chrome api methods used by listener.js
    var stubChromeAPI = function() {
        chrome = {};
        chrome.pageAction = {};
        chrome.pageAction.show = function() {
            chrome.pageAction.show.called = true;
        };
        chrome.pageAction.show.called = false;

        chrome.pageAction.setIcon = function(options) {
            chrome.pageAction.setIcon.called = true;
            chrome.pageAction.setIcon.path = options.path;
        };
        chrome.pageAction.setIcon.called = false;
        chrome.pageAction.setIcon.path = null;


        chrome.tabs = {};
        chrome.tabs.update = function(tabId, options) {
            chrome.tabs.update.called = true;
            chrome.tabs.update.url = options.url;
        };
        chrome.tabs.update.called = false;
        chrome.tabs.update.url = null;
    };

    var stubSessionManager = function() {
        // saving reference to session manager
        _sessionManager = philanthropist.sessionManager;

        philanthropist.sessionManager = {};
        philanthropist.sessionManager.isCurrentSessionAffiliated = function(callback) {
           var sessionId = philanthropist.sessionManager.sessionId;
           var isAffiliated = philanthropist.sessionManager.isAffiliated;
           callback(sessionId, isAffiliated);
        };

        philanthropist.sessionManager.affiliateSession = function() {};
    };

    var unstubSessionManager = function() {
        philanthropist.sessionManager = _sessionManager;
    };

    var constants = {
        urls: {
            google: 'https://www.google.com/',
            amazon: 'https://www.amazon.com/',
            affiliatedAmazon: 'https://www.amazon.com/?tag=default' 
        },
        // needs to be kept in sync with values from
        // lib/background/listener.js
        iconPaths: {
            configured: '/assets/green.png',
            notConfigured: '/assets/red.png'
        }
    };

    var defaults = {
        affiliateId: 'affiliateId',
        tabId: 1,
        changeInfo: {
            status: 'loading' 
        },
        tab: {}
    };

    $(document).ready(function() {
        // get local reference to listener
        var listener = window.philanthropist.listener;
        
        module('Background Listener', {
            setup: function() {
                // need to clear local storage to get clean slate
                window.localStorage.clear(); 

                stubChromeAPI();
                stubSessionManager();
                
                listener.init();
            },
            teardown: function() {
                unstubSessionManager();
            }
        });

        test('change info status is not loading', function() {
            var tab = $.extend(defaults.tab, { url: constants.urls.google }); 
            var changeInfo = { status: 'complete' };
            listener.processTabUpdate(constants.tabId, changeInfo, tab);

            ok(!chrome.pageAction.show.called);
            ok(!chrome.tabs.update.called);
        });

        test('site other than amazon visisted', function() {
            var tab = $.extend(defaults.tab, { url: constants.urls.google }); 
            listener.processTabUpdate(constants.tabId, defaults.changeInfo, tab);

            ok(!chrome.pageAction.show.called);
            ok(!chrome.tabs.update.called);
        });
        
        test('amazon visited without affilate configured', function() {
            var tab = $.extend(defaults.tab, { url: constants.urls.amazon }); 
            listener.processTabUpdate(defaults.tabId, defaults.changeInfo, tab);
            
            ok(chrome.pageAction.show.called);
            ok(!chrome.tabs.update.called);
            strictEqual(chrome.pageAction.setIcon.path,
                        constants.iconPaths.notConfigured);
        });
    
        test('amazon visited with affiliate configured and an unaffiliated session', 
        function() {
            // configure affiliate
            window.localStorage.affiliateId = defaults.affiliateId;
            philanthropist.sessionManager.sessionId = 'sessionId';
            philanthropist.sessionManager.isAffiliated = false;

            var tab = $.extend(defaults.tab, { url: constants.urls.amazon }); 
            listener.processTabUpdate(defaults.tabId, defaults.changeInfo, tab);

            ok(chrome.pageAction.show.called);
            ok(chrome.tabs.update.called);
            strictEqual(chrome.pageAction.setIcon.path,
                        constants.iconPaths.configured);
        });
        
        test('amazon visited with affiliate configured and an affiliated session', 
        function() {
            window.localStorage.affiliateId = defaults.affiliateId;
            philanthropist.sessionManager.sessionId = 'sessionId';
            philanthropist.sessionManager.isAffiliated = true;
            
            var tab = $.extend(defaults.tab, { url: constants.urls.affiliatedAmazon }); 
            listener.processTabUpdate(defaults.tabId, defaults.changeInfo, tab);

            ok(chrome.pageAction.show.called);
            ok(!chrome.tabs.update.called);
            strictEqual(chrome.pageAction.setIcon.path,
                        constants.iconPaths.configured);
        });            
    });            
})();
