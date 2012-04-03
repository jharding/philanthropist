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

    $(document).ready(function() {
        // caching reference to the affiliates DOM element
        var affiliatesSection = $('#affiliates');

        // responsible for displaying messages
        var displayMessage = function(message) {
            // remove all previous alerts
            $('.alert').alert('close');

            message.prependTo(affiliatesSection);
        };

        // determines what initial message should be shown based on current
        // configurations
        var displayInitialMessage = function(affiliateId) {
            var message = null;

            // user currently has an affiliate configured, so just
            // display their current configuration
            if (affiliateId) {
                message = ich['current-configuration-alert']({
                    affiliateId: affiliateId
                });
            }

            // user currently doesn't have an affiliate configured
            // so let's warn them 
            else {
                message = ich['no-affiliate-alert']();
            }
        
            displayMessage(message);
        };

        // gets the affiliate id from user input and saves it 
        // to local storage
        var saveAffiliateInfo = function(event) {
            event.preventDefault();

            var form = $(event.currentTarget);
            var userInput = form.find('input[name="affiliate-id"]').val(); 
            
            var message = null;

            var affiliateId = null;

            // user input was a url
            if (isUrl(userInput)) {
                affiliateId = getAffiliateIdFromUrl(userInput);

                // the url provided didn't contain the affiliate id
                if (!affiliateId) {
                    message = ich['cannot-find-affiliate-id-alert']();
                    displayMessage(message);
                    return;
                }
            }

            // user input was the affiliate id
            else {
                affiliateId = userInput;
            }

            // store affiliateId in local storage for persistance
            localStorage.setItem('affiliateId', affiliateId);

            message = ich['success-alert']({
                affiliateId: affiliateId
            });
            displayMessage(message);
        };

        displayInitialMessage(localStorage.getItem('affiliateId'));

        $('#affiliates form').on('submit', saveAffiliateInfo);
    });
})(window.jQuery);
