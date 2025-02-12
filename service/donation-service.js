'use strict';
const apigw = rootRequire('utility/network-apigw');
const logger = rootRequire('utility/logger');
const CRM_ENDPOINT = rootRequire('config/crm.js').endPoint;
const Q = require("q");

function _service(context){ this.context = context; }

_service.prototype.createDonationTransaction = function (onlineDonationTranscaction) {
	const deferred = Q.defer();
	const failureRes = {
		errorMessage : "Fail to create online donation transaction",
		developerErrorMessage : "Fail to create online donation transaction"
	};
	
    const _reqParam = {
        endpoint: CRM_ENDPOINT.createDonationTransaction,
        jsonData: onlineDonationTranscaction,
        context: this.context
    }

	apigw.post(_reqParam)
		.then((response) => {
			if (response.statusCode < 400) {
				if (response.body.Success){
					deferred.resolve(response.body);
				} else {
					if (response.body.Remarks) {
						logger.debug(">>> response.body.Remarks", response.body.Remarks);
						failureRes["developerErrorMessage"] = "[APIGW-ERROR] " + response.body.Remarks;
					} else {
						logger.debug(">>> response.body.Remarks", response.body.message);
						failureRes["developerErrorMessage"] = "[APIGW-ERROR] " + response.body.message;
					}

					deferred.reject(failureRes)
				}
			} else {
				failureRes["developerErrorMessage"] = "[APIGW-ERROR] " + response.body.developer_message;
				deferred.reject(failureRes)
			}
		})
		.fail((error) => {
			deferred.reject(failureRes)
		});
    
	return deferred.promise;
}

module.exports = _service;
