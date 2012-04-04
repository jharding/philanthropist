/*globals chrome, URI */

(function() {
    // module dependencies
    var sessionManager = null;
    var store = null;

    // module declaration
    var tabManager = {};

    var kAmazonHostname = 'www.amazon.com';
    var kAffiliateParameterKey = 'tag';
    var kMaxAge = 60 * 60 * 1000;
    var kIconPaths = {
        configured: '/assets/green.png',
        notConfigured: '/assets/red.png'
    };

    // updates the tabs url to an affiliated url
    var redirectToAffiliateUrl = function(tabId, currentUrl, affiliateId) {
        var affiliateUrl = new URI(currentUrl);
        affiliateUrl.addSearch(kAffiliateParameterKey, affiliateId); 

        chrome.tabs.update(tabId, {
            url: affiliateUrl.toString()
        });
    };

    // displays the correct page action icon
    var displayPageActionIcon = function(tabId, affiliateId) {
        // user has an affiliate configured
        if (affiliateId) {
            chrome.pageAction.setIcon({
                tabId: tabId,
                path: kIconPaths.configured
            });
        }

        // user has yet to configure an affiliate
        else {
            chrome.pageAction.setIcon({
                tabId: tabId,
                path: kIconPaths.notConfigured
            });
        }
        
        chrome.pageAction.show(tabId);
    };

    // on tab update, determines whether tab needs to be redirected
    // to an affiliate url. function is exposed for testing reasons
    tabManager.processTabUpdate =  function(tabId, changeInfo, tab) {
        var affiliateId = store.get('affiliateId');
        
        var url = new URI(tab.url);
        var hostname = url.hostname();
        var parameterMap = url.search(true);
 
        // if either the page isn't in a loading state or if the user has yet
        // to configure an affiliate to use, just return and do nothing
        var inLoadingState = changeInfo.status === 'loading';
        if (!inLoadingState) {
            return; 
        }

        // tab isn't visiting a page within the amazon domain so just return 
        var isAmazonDomain = hostname === kAmazonHostname; 
        if (!isAmazonDomain) {
            return;
        }

        // show icon when visiting a page under the amazon domain
        displayPageActionIcon(tabId, affiliateId);

        // the user is directly accessing Amazon through an affiliate url
        var affiliateParameterValue = parameterMap[kAffiliateParameterKey];
        var isVisitingAffiliatedUrl = typeof affiliateParameterValue !== 'undefined';
        sessionManager.registerCurrentSession(function(session) {
            if (session) {
                // the user is accessing amazon with an affiliate parameter
                // so mark this session as affiliated
                if (isVisitingAffiliatedUrl) {
                    sessionManager.affiliateSession(session.id, affiliateParameterValue);
                }

                // the user has an affiliate configured, the session isn't already
                // affilated and the user isn't visiting a affiliated url directly
                if (affiliateId && !session.isAffiliated && !isVisitingAffiliatedUrl) {
                    redirectToAffiliateUrl(tabId, tab.url, affiliateId);
                }
            }
        });
    };

    tabManager.init = function() {
        // local reference to module dependencies
        store = window.philanthropist.store;
        sessionManager = window.philanthropist.sessionManager;
    };

    // starts listening for tab updates
    tabManager.start = function() {
        chrome.tabs.onUpdated.addListener(tabManager.processTabUpdate);
    };

    // exposing interface
    window.philanthropist = window.philanthropist || {};
    window.philanthropist.tabManager = tabManager;
})();
