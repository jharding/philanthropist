/*globals _ */

(function() {
    // module declaration
    var logger = {};

    // no point in hiding key as it can easily be figured out
    var kLogglyKey = '622c6e10-7f1b-4083-93a6-74870b1a4310';
    var kLogUrl = 'https://logs.loggly.com/inputs/' + kLogglyKey;

    var logMessage = function(data) {
        // normalize log data
        if (!_(data).isString()) {
            try {
                data = JSON.stringify(data);
            } 
            catch(e) {
                return;
            }
        }

        var formData = new FormData();
        formData.append('source', data);

        var req = new XMLHttpRequest();
        req.open("POST", kLogUrl, false);
        req.send(formData);
    };

    logger.log = function(data) {
        logMessage(data);
    };
    
    logger.debug = function(data) {
        logMessage(data);
    };

    logger.info = function(data) {
        logMessage(data);
    };
    
    logger.warn = function(data) {
        logMessage(data);
    };
    
    logger.error = function(data) {
        logMessage(data);
    };
    
    logger.init = function() {
        // nothing to do for now
    };

    // exposing session manager module
    window.philanthropist = window.philanthropist || {};
    window.philanthropist.logger = logger;
})();
