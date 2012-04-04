/*globals chrome */

(function() {
    // module declaration
    var store = {};

    store.set = function(key, value) {
        localStorage.setItem(key, value);
    };

    store.get = function(key) {
        return localStorage.getItem(key);
    };
    
    store.init = function() {
        // nothing to do for now
    };

    // exposing session manager module
    window.philanthropist = window.philanthropist || {};
    window.philanthropist.store = store;
})();
