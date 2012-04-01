(function($) {
    $(document).ready(function() {
        $('#affiliate-settings').on('submit', function(event) {
            event.preventDefault();

            var form = $(event.currentTarget);
            window.localStorage.affiliateAlias = form.find('.alias').val(); 
            window.localStorage.affiliateId = form.find('.id').val(); 

            alert('saved');
        });
    });
})(window.jQuery);
