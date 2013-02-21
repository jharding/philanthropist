/*globals chrome, URI */

(function() {
    // module dependencies
    var sessionManager = null;
    var store = null;

    // module declaration
    var tabManager = {};

    var kAmazonHostname = 'www.amazon.com';
    var kAssociateParameterKey = 'tag';
    var kMaxAge = 60 * 60 * 1000;
    var kIconPaths = {
        configured: '/assets/blue_tophat16.png',
        notConfigured: '/assets/red_tophat16.png'
    };

    // updates the tabs url to an associated url
    var redirectToAssociateUrl = function(tabId, currentUrl, associateId) {
        var associateUrl = new URI(currentUrl);
        associateUrl.addSearch(kAssociateParameterKey, associateId); 

        chrome.tabs.update(tabId, {
            url: associateUrl.toString()
        });
    };

    // displays the correct page action icon
    var displayPageActionIcon = function(tabId, isAssociated) {
        // session is associated
        if (isAssociated) {
            chrome.pageAction.setIcon({
                tabId: tabId,
                path: kIconPaths.configured
            });
        }

        else {
            chrome.pageAction.setIcon({
                tabId: tabId,
                path: kIconPaths.notConfigured
            });
        }
        
        chrome.pageAction.show(tabId);
    };

    // on tab update, determines whether tab needs to be redirected
    // to an associate url. function is exposed for testing reasons
    tabManager.processTabUpdate =  function(tabId, changeInfo, tab) {
        var associateId = store.get('associateId');
        
        var url = new URI(tab.url);
        var hostname = url.hostname();
        var parameterMap = url.search(true);
 
        // if either the page isn't in a loading state or if the user has yet
        // to configure an associate to use, just return and do nothing
        var inLoadingState = changeInfo.status === 'loading';
        if (!inLoadingState) {
            return; 
        }

        // tab isn't visiting a page within the amazon domain so just return 
        var isAmazonDomain = hostname === kAmazonHostname; 
        if (!isAmazonDomain) {
            return;
        }

        // the user is directly accessing Amazon through an associate url
        var associateParameterValue = parameterMap[kAssociateParameterKey];
        var isVisitingAssociatedUrl = typeof associateParameterValue !== 'undefined';
        sessionManager.registerCurrentSession(function(session) {
            if (session) {
                // the user is accessing amazon with an associate parameter
                // so mark this session as associated
                if (isVisitingAssociatedUrl) {
                    sessionManager.associateSession(session.id, associateParameterValue);
                }

                // the user has an associate configured, the session isn't already
                // affilated and the user isn't visiting a associated url directly
                if (associateId && !session.isAssociated && !isVisitingAssociatedUrl) {
                    redirectToAssociateUrl(tabId, tab.url, associateId);
                }
              
                // if either the session was already associated or if the
                // current url is an associate url, then the session is associated
                var isAssociated = session.isAssociated || isVisitingAssociatedUrl;
                displayPageActionIcon(tabId, isAssociated);
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
