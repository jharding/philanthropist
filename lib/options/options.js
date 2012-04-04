/*globals _, Backbone, chrome, OptionsView*/

(function($) {
    // really don't need the functionality of a backbone model, so 
    // i'm just using a very simple custom model
    var Options = function() {
        this.initialize();  
    };

    _.extend(Options.prototype, {
        initialize: function() {
            _(this).bindAll();

            this.affiliateIdKey = 'affiliateId';

            // getting references to background script objects
            var backgroundPage = chrome.extension.getBackgroundPage();
            this.store = backgroundPage.philanthropist.store;
            this.sessionManager = backgroundPage.philanthropist.sessionManager;

            this.view = new OptionsView({ model: this });
        },

        getAffiliateId: function() {
            return this.store.get(this.affiliateIdKey);
        },

        setAffiliateId: function(value) {
            return this.store.set(this.affiliateIdKey, value);
        },

        getAffiliateIdForCurrentSession: function() {
            var session = this.sessionManager.getCurrentSession();
            return session.affilaiteId;
        }
    });

    $(document).ready(function() {
        var options = new Options();
    });

    window.Options = Options;
})(window.jQuery);
