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

            this.associateIdKey = 'associateId';

            // getting references to background script objects
            var backgroundPage = chrome.extension.getBackgroundPage();
            this.store = backgroundPage.philanthropist.store;
            this.sessionManager = backgroundPage.philanthropist.sessionManager;

            this.view = new OptionsView({ model: this });
        },

        getAssociateId: function() {
            return this.store.get(this.associateIdKey);
        },

        setAssociateId: function(value) {
            return this.store.set(this.associateIdKey, value);
        },

        getAssociateIdForCurrentSession: function() {
            var session = this.sessionManager.getCurrentSession();
            return session ? session.associateId : null;
        }
    });

    $(document).ready(function() {
        var options = new Options();
    });

    window.Options = Options;
})(window.jQuery);
