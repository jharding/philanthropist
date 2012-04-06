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
        configured: '/assets/green.png',
        notConfigured: '/assets/red.png'
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
    var displayPageActionIcon = function(tabId, associateId) {
        // user has an associate configured
        if (associateId) {
            chrome.pageAction.setIcon({
                tabId: tabId,
                path: kIconPaths.configured
            });
        }

        // user has yet to configure an associate
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

        // show icon when visiting a page under the amazon domain
        displayPageActionIcon(tabId, associateId);

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
