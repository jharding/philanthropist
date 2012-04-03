/*globals localStorage */

(function() {
    var kInstalledPage = 'lib/options/options.html';

    // user just installed the extension, so take them to the settings page
    if (!localStorage.getItem('installTime')) {
        var now = (new Date()).getTime();
        localStorage.setItem('installTime', now);
        chrome.tabs.create({ url: kInstalledPage });
    }

    window.philanthropist.listener.start();
})();
