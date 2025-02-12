'use strict';
const commonError = ['EvalError', 'InternalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError']
const logger = rootRequire('utility/logger');


module.exports = {
    isCommonError: (errorType, errorMsg) => {
        logger.error(errorMsg);
        if (commonError.indexOf(errorType) < 0){
            return false;
        }
        return true;
    }
}