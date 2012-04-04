/*globals */

(function($) {
    var Options = Backbone.Model.extend({
        initialize: function() {
            _(this).bindAll();

            this.view = new OptionsView({ model: this });
        },

        // always retrieve data from local storage 
        get: function(attr) {
            return localStorage.getItem(attr);
        },

        // making set very dumb because nothing complex is needed
        set: function(key, value, options) {
            localStorage.setItem(key, value);
        }
    });

    $(document).ready(function() {
        var options = new Options();
    });

    window.Options = Options;
})(window.jQuery);
