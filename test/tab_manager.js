/*globals chrome: true, module, ok, strictEqual, test, URI */

(function() {
    var _sessionManager = null;

    // stubs out the chrome api methods used by tab_manager.js
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
        philanthropist.sessionManager.registerCurrentSession = function(callback) {
            var sessionId = philanthropist.sessionManager.sessionId;
            var isAssociated = philanthropist.sessionManager.isAssociated;
            callback({
                id: sessionId,
                isAssociated: isAssociated
           });
        };

        philanthropist.sessionManager.associateSession = function() {};
    };

    var unstubSessionManager = function() {
        philanthropist.sessionManager = _sessionManager;
    };

    var constants = {
        urls: {
            google: 'https://www.google.com/',
            amazon: 'https://www.amazon.com/',
            associatedAmazon: 'https://www.amazon.com/?tag=default' 
        },
        // needs to be kept in sync with values from
        // lib/background/tab_manager.js
        iconPaths: {
            configured: '/assets/green.png',
            notConfigured: '/assets/red.png'
        }
    };

    var defaults = {
        associateId: 'associateId',
        tabId: 1,
        changeInfo: {
            status: 'loading' 
        },
        tab: {}
    };

    $(document).ready(function() {
        // get local reference to tabManager
        var tabManager = window.philanthropist.tabManager;
        
        module('Background Tab Manager', {
            setup: function() {
                // need to clear local storage to get clean slate
                window.localStorage.clear(); 

                stubChromeAPI();
                stubSessionManager();
                
                tabManager.init();
            },
            teardown: function() {
                unstubSessionManager();
            }
        });

        test('change info status is not loading', function() {
            var tab = $.extend(defaults.tab, { url: constants.urls.google }); 
            var changeInfo = { status: 'complete' };
            tabManager.processTabUpdate(constants.tabId, changeInfo, tab);

            ok(!chrome.pageAction.show.called);
            ok(!chrome.tabs.update.called);
        });

        test('site other than amazon visisted', function() {
            var tab = $.extend(defaults.tab, { url: constants.urls.google }); 
            tabManager.processTabUpdate(constants.tabId, defaults.changeInfo, tab);

            ok(!chrome.pageAction.show.called);
            ok(!chrome.tabs.update.called);
        });
        
        test('amazon visited without affilate configured', function() {
            var tab = $.extend(defaults.tab, { url: constants.urls.amazon }); 
            tabManager.processTabUpdate(defaults.tabId, defaults.changeInfo, tab);
            
            ok(chrome.pageAction.show.called);
            ok(!chrome.tabs.update.called);
            strictEqual(chrome.pageAction.setIcon.path,
                        constants.iconPaths.notConfigured);
        });
    
        test('amazon visited with associate configured and an unassociated session', 
        function() {
            // configure associate
            window.localStorage.associateId = defaults.associateId;
            philanthropist.sessionManager.sessionId = 'sessionId';
            philanthropist.sessionManager.isAssociated = false;

            var tab = $.extend(defaults.tab, { url: constants.urls.amazon }); 
            tabManager.processTabUpdate(defaults.tabId, defaults.changeInfo, tab);

            ok(chrome.pageAction.show.called);
            ok(chrome.tabs.update.called);
            strictEqual(chrome.pageAction.setIcon.path,
                        constants.iconPaths.configured);
        });
        
        test('amazon visited with associate configured and an associated session', 
        function() {
            window.localStorage.associateId = defaults.associateId;
            philanthropist.sessionManager.sessionId = 'sessionId';
            philanthropist.sessionManager.isAssociated = true;
            
            var tab = $.extend(defaults.tab, { url: constants.urls.associatedAmazon }); 
            tabManager.processTabUpdate(defaults.tabId, defaults.changeInfo, tab);

            ok(chrome.pageAction.show.called);
            ok(!chrome.tabs.update.called);
            strictEqual(chrome.pageAction.setIcon.path,
                        constants.iconPaths.configured);
        });            
    });            
})();
