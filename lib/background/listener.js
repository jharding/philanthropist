/*globals chrome,localStorage, URI */

(function() {
    var listener = {};

    // constants
    var kAmazonHostname = 'www.amazon.com';
    var kAffiliateParameterKey = 'tag';
    var kMaxAge = 60 * 60 * 1000;

    // the last time the user visited amazon with an affiliated url
    var lastAffiliatedVisit = 0;

    // returns milliseconds sinch epoch
    var getCurrentTime = function() {
        var date = new Date();
        return date.getTime(); 
    };

    // on tab update, determines whether tab needs to be redirected
    // to an affiliate url
    listener.processTabUpdate =  function(tabId, changeInfo, tab) {
        var affiliateId = localStorage.getItem('affiliateId');
        
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
        chrome.pageAction.show(tabId);
     
        if (!affiliateId) {
            return;
        }

        // the user is directly accessing Amazon through an affiliate link
        var hasAffiliateParameter = typeof parameterMap[kAffiliateParameterKey] !== 'undefined';
        if (hasAffiliateParameter) {
            lastAffiliatedVisit = getCurrentTime();
            return;
        }

        // if an affiliate link hasn't been visited since kMaxAge
        // construct affiliate url based on current one being visited and go there
        var isCacheExpired = lastAffiliatedVisit + kMaxAge < getCurrentTime();
        if (isCacheExpired) {
            var affiliateUrl = new URI(tab.url);
            affiliateUrl.addSearch(kAffiliateParameterKey, affiliateId); 

            chrome.tabs.update(tabId, {
                url: affiliateUrl.toString()
            });
        }
    };

    // resets the timestamp for last affiliated visit
    listener.emptyCache = function() {
        lastAffiliatedVisit = 0;
    };

    // starts listening for tab updates
    listener.start = function() {
        chrome.tabs.onUpdated.addListener(listener.processTabUpdate);
    };

    // exposing interface
    window.philanthropist = window.philanthropist || {};
    window.philanthropist.listener = listener;
})();
