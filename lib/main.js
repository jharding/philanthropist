/*globals chrome, URI */

(function() {

    var getCurrentTime = function() {
        var date = new Date();
        return date.getTime(); 
    };
    
    var amazonHostname = 'www.amazon.com';
    var affiliateParameterKey = 'tag';

    var checkForAmazon =  function(tabId, changeInfo, tab) {
        // only act when in loading state, do nothing when in any other state
        var inLoadingState = changeInfo.status === 'loading';
        if (!inLoadingState) {
            return; 
        }

        var url = new URI(tab.url);
        var hostname = url.hostname();
 
        // tab isn't visiting a page within the amazon domain so just return 
        var isAmazonDomain = hostname === amazonHostname; 
        if (!isAmazonDomain) {
            return;
        }

        // show icon when visiting a page under the amazon domain
        chrome.pageAction.show(tabId);
        
        var parameterMap = url.search(true);

        // if the affiliate parameter is missing from the amazon url and
        // the user has configured a affiliate construct new url with one and go there
        var hasAffiliateParamter = typeof parameterMap[affiliateParameterKey] !== 'undefined'; 
        var affiliateId = window.localStorage.affiliateId;
        if (!hasAffiliateParamter && affiliateId) {
            var newUrl = new URI(tab.url);
            newUrl.addSearch(affiliateParameterKey, affiliateId); 

            chrome.tabs.update(tabId, {
                url: newUrl.toString()
            });
        }
    };

    chrome.tabs.onUpdated.addListener(checkForAmazon);
})();
