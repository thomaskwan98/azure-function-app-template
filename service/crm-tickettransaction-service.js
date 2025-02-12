'use strict';
const apigw = rootRequire('utility/network-apigw');
const logger = rootRequire('utility/logger');
const CMS_ENDPOINT = rootRequire('config/crm.js').endPoint;
const Q = require("q");

function _service(context){ this.context = context; }

_service.prototype.createTicketingTransaction  = function(ticketTransactionData) {
	const deferred = Q.defer();
	const failureRes = {
		errorMessage : "Fail to create CRM Ticketing Transaction",
		developerErrorMessage : "Fail to create CRM Ticketing Transaction"
	};
	// set request ca params
    const _reqParam = {
        endpoint: CMS_ENDPOINT.createCRMTicketTransaction,
        jsonData: ticketTransactionData,
        context: this.context
    }
    
	console.log(_reqParam.jsonData)

	// call ca -> Internal Create patron account
	apigw.post(_reqParam)
		.then((response) => {
			// response result
			var result = {}; 
			// response success
			if (response.statusCode < 400) {
				result.Body = response.body;
				deferred.resolve(result);
			} else {
				// errorMessage
                var errorCode = response.body.error_code;
                errorCode = errorCode ? errorCode : response.statusCode;
                var errorMsg = response.body.developer_message;
                errorMsg = errorMsg ? errorMsg : JSON.stringify(response.body);
                failureRes["developerErrorMessage"] = "[APIGW-" + errorCode + "] " + errorMsg;
				deferred.reject(failureRes);
			}
		})
		.fail((error) => {
			deferred.reject(failureRes)
		});
    
   
	return deferred.promise;
}

module.exports = _service;