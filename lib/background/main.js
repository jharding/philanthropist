/*globals chrome */

(function() {
    var store = window.philanthropist.store;

    var kInstalledPage = 'lib/options/options.html';

    // user just installed the extension, so take them to the settings page
    if (!store.get('installTime')) {
        var now = (new Date()).getTime();
        store.set('installTime', now);
        chrome.tabs.create({ url: kInstalledPage });
    }

    // initializing the modules
    window.philanthropist.tabManager.init();
    window.philanthropist.sessionManager.init();

    // tabManager is now listening for tab updates
    window.philanthropist.tabManager.start();

    // open up new tab with the settings page when user clicks icon
    chrome.pageAction.onClicked.addListener(function(tab) {
        chrome.tabs.create({ url: kInstalledPage });
    });
})();
