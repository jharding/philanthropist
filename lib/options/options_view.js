/*globals _, Backbone, ich, URI */

(function($) {
    // dumb function for determining whether a string is a url
    var isUrl = function(url) {
        var urlComponents = URI.parse(url);
        return !!urlComponents.hostname;
    };

    // parses url string for associate id
    var getAssociateIdFromUrl = function(url) {
        url = new URI(url);
        var parameterMap = url.search(true);

        return parameterMap.tag;
    };

    var OptionsView = Backbone.View.extend({
        el: '#options-page',

        events: {
            'submit #settings form': 'saveAssociateInfo' 
        },

        initialize: function() {
            _(this).bindAll();

            this.$alertContainer = this.$('.alert-container');

            this.checkForConfiguration();
            this.renderYourSettings();
        },
        
        displayMessage: function(message) {
            this.$alertContainer.html(message);
        },

        checkForConfiguration: function() {
            var associateId = this.model.getAssociateId();

            // user currently doesn't have an associate configured
            // so let's warn them 
            if (!associateId) {
                var message = ich['no-associate-alert']();
                this.displayMessage(message);
            }
        },

        renderYourSettings: function() {
            var $configuredAssociate = this.$('.your-settings .configured-associate');
            var $sessionAssociate = this.$('.your-settings .session-associate');

            var configuredAssociateId = this.model.getAssociateId();
            var sessionAssociateId = this.model.getAssociateIdForCurrentSession();

            if (configuredAssociateId) {
                $configuredAssociate.html(ich['configured-associate']({
                    associateId: configuredAssociateId
                }));
            }

            else {
                $configuredAssociate.html(ich['no-configured-associate']());
            }

            if (sessionAssociateId) {
                $sessionAssociate.html(ich['session-associate']({
                    associateId: sessionAssociateId
                }));
            }

            else {
                $sessionAssociate.html(ich['no-session-associate']());
            }
        },

        saveAssociateInfo: function(event) {
            event.preventDefault();

            var $form = $(event.currentTarget);
            var userInput = $form.find('input[name="associate-id"]').val(); 
            
            var associateId = null;
            var message = null;

            // user entered an associate url, check for associate id
            if (isUrl(userInput)) {
                associateId = getAssociateIdFromUrl(userInput);

                // the url provided didn't contain the associate id
                if (!associateId) {
                    message = ich['cannot-find-associate-id-alert']();
                    this.displayMessage(message);
                    return;
                }
            }

            // user input was the associate id
            else {
                associateId = userInput;
            }

            this.model.setAssociateId(associateId);

            message = ich['success-alert']({ associateId: associateId });
            this.displayMessage(message);

            this.renderYourSettings();
        }
    });

    window.OptionsView = OptionsView;
})(window.jQuery);
