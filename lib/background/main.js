/*globals localStorage */

(function() {
    var kInstalledPage = 'lib/options/options.html';

    // user just installed the extension, so take them to the settings page
    if (!localStorage.getItem('installTime')) {
        var now = (new Date()).getTime();
        localStorage.setItem('installTime', now);
        chrome.tabs.create({ url: kInstalledPage });
    }

    // listener is now listening for tab updates
    window.philanthropist.listener.start();

    // open up new tab with the settings page when user clicks icon
    chrome.pageAction.onClicked.addListener(function(tab) {
        chrome.tabs.create({ url: kInstalledPage });
    });
})();
