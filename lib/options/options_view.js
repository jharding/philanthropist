/*globals ich, URI */

(function($) {
    // dumb function for determining whether a string is a url
    var isUrl = function(url) {
        var urlComponents = URI.parse(url);
        return !!urlComponents.hostname;
    };

    // parses url string for affilate id
    var getAffiliateIdFromUrl = function(url) {
        url = new URI(url);
        var parameterMap = url.search(true);

        return parameterMap.tag;
    };

    var OptionsView = Backbone.View.extend({
        el: '#options-page',

        events: {
            'submit #affiliates form': 'saveAffiliateInfo' 
        },

        initialize: function() {
            _(this).bindAll();

            this.affiliatesSection = this.$('#affiliates');

            this.displayInitialMessage();
        },
        
        displayMessage: function(message) {
            // remove all previous alerts
            $('.alert').alert('close');

            message.prependTo(this.affiliatesSection);
        },

        displayInitialMessage: function() {
            var affiliateId = this.model.getAffiliateId();

            var message = null;

            // user currently has an affiliate configured, so just
            // display their current configuration
            if (affiliateId) {
                message = ich['current-configuration-alert']({
                    affiliateId: affiliateId });
            }

            // user currently doesn't have an affiliate configured
            // so let's warn them 
            else {
                message = ich['no-affiliate-alert']();
            }
        
            this.displayMessage(message);
        },
        
        saveAffiliateInfo: function(event) {
            event.preventDefault();

            var form = $(event.currentTarget);
            var userInput = form.find('input[name="affiliate-id"]').val(); 
            
            var affiliateId = null;
            var message = null;

            // user entered an affiliate url, check for affiliate id
            if (isUrl(userInput)) {
                affiliateId = getAffiliateIdFromUrl(userInput);

                // the url provided didn't contain the affiliate id
                if (!affiliateId) {
                    message = ich['cannot-find-affiliate-id-alert']();
                    this.displayMessage(message);
                    return;
                }
            }

            // user input was the affiliate id
            else {
                affiliateId = userInput;
            }


            this.model.setAffiliateId(affiliateId);

            message = ich['success-alert']({ affiliateId: affiliateId });
            this.displayMessage(message);
        }
    });

    window.OptionsView = OptionsView;
})(window.jQuery);
