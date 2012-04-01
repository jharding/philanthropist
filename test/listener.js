/*globals chrome, module, ok, strictEqual, test, URI */

$(document).ready(function() {
    // flags used to see if chrome API methods were called
    var tabUpdated = null;
    var pageActionShown = null;
    var redirectUrl = null;

    // stubbing out chrome API
    chrome = {};
    chrome.pageAction = {};
    chrome.pageAction.show = function() {
        pageActionShown = true;
    };
    chrome.tabs = {};
    chrome.tabs.update = function(tabId, options) {
        tabUpdated = true;
        redirectUrl = options.url;
    };

    // default values to be used throughout the tests
    var defaults = {
        affiliateId: 'default',
        tabId: 1,
        changeInfo: {
            status: 'loading' 
        },
        tab: {}
    };

    var urls = {
        google: 'https://www.google.com/',
        amazon: 'https://www.amazon.com/',
        affiliatedAmazon: 'https://www.amazon.com/?tag=default' 
    };

    // get local reference to listener
    var listener = window.philanthropist.listener;

    module('Background Listener', {
        setup: function() {
            // need to clear local storage to get clean slate
            window.localStorage.clear(); 

            tabUpdated = false;
            pageActionShown = false;
            redirectUrl = null;
        }
    });

    test('site other than amazon visisted', function() {
        var tab = $.extend(defaults.tab, { url: urls.google }); 
        listener.processTabUpdate(defaults.tabId, defaults.changeInfo, tab);

        ok(!tabUpdated);
        ok(!pageActionShown);
    });
    
    test('amazon visited without affilate configured', function() {
        var tab = $.extend(defaults.tab, { url: urls.amazon }); 
        listener.processTabUpdate(defaults.tabId, defaults.changeInfo, tab);
        
        ok(!tabUpdated);
        ok(pageActionShown);
    });

    test('amazon visited with affiliate configured (empty cache)', function() {
        listener.emptyCache();
        window.localStorage.affiliateId = defaults.affiliateId;
        
        var tab = $.extend(defaults.tab, { url: urls.amazon }); 
        listener.processTabUpdate(defaults.tabId, defaults.changeInfo, tab);

        var url = new URI(redirectUrl);
        var parameterMap = url.search(true);
        var urlAffiliateId = parameterMap.tag;

        strictEqual(urlAffiliateId, defaults.affiliateId);
        ok(tabUpdated);
        ok(pageActionShown);
    });

    test('amazon visited with affiliate configured (primed cache)', function() {
        window.localStorage.affiliateId = defaults.affiliateId;
        
        var tab = $.extend(defaults.tab, { url: urls.affiliatedAmazon }); 
        listener.processTabUpdate(defaults.tabId, defaults.changeInfo, tab);
        
        tabUpdated = false;
        pageActionShown = false;
        redirectUrl = null;
        tab = $.extend(defaults.tab, { url: urls.amazon }); 
        listener.processTabUpdate(defaults.tabId, defaults.changeInfo, tab);
        
        ok(!tabUpdated);
        ok(pageActionShown);
    });
});
