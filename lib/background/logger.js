/*globals _ */

(function() {
    // module declaration
    var logger = {};

    var kLogUrl = 'http://philanthropist.herokuapp.com/log';

    var logMessage = function(log) {
        var query = URI.buildQuery({
            l: log.level,
            m: log.message
        });

        var beacon = new Image();
        beacon.src = kLogUrl + '?' + query;
    };

    logger.log = function(message) {
        logMessage({
            level: 'LOG',
            message: message
        });
    };
    
    logger.debug = function(message) {
        logMessage({
            level: 'DEBUG',
            message: message
        });
    };

    logger.info = function(message) {
        logMessage({
            level: 'INFO',
            message: message
        });
    };
    
    logger.warn = function(message) {
        logMessage({
            level: 'WARN',
            message: message
        });
    };
    
    logger.error = function(message) {
        logMessage({
            level: 'ERROR',
            message: message
        });
    };
    
    logger.init = function() {
        // nothing to do for now
    };

    // exposing session manager module
    window.philanthropist = window.philanthropist || {};
    window.philanthropist.logger = logger;
})();
