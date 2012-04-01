/*globals chrome, URI */

(function() {
    // constants
    var kAmazonHostname = 'www.amazon.com';
    var kAffiliateParameterKey = 'tag';
    var kMaxAge = 60 * 60 * 1000;

    var lastAffiliatedVisit = 0;

    // returns milliseconds sinch epoch
    var getCurrentTime = function() {
        var date = new Date();
        return date.getTime(); 
    };

    var processTabUpdate =  function(tabId, changeInfo, tab) {
        var affiliateId = window.localStorage.affiliateId;

        // if either the page isn't in a loading state or if the user has yet
        // to configure an affiliate to use, just return and do nothing
        var inLoadingState = changeInfo.status === 'loading';
        var affiliateIsConfigured = typeof affiliateId !== 'undefined';
        if (!inLoadingState || !affiliateIsConfigured) {
            return; 
        }

        var url = new URI(tab.url);
        var hostname = url.hostname();
 
        // tab isn't visiting a page within the amazon domain so just return 
        var isAmazonDomain = hostname === kAmazonHostname; 
        if (!isAmazonDomain) {
            return;
        }

        // show icon when visiting a page under the amazon domain
        chrome.pageAction.show(tabId);
      
        var parameterMap = url.search(true);

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

    chrome.tabs.onUpdated.addListener(processTabUpdate);
})();
