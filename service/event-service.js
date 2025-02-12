'use strict';
const apigw = rootRequire('utility/network-apigw');
const logger = rootRequire('utility/logger');
const ERP_ENDPOINT = rootRequire('config/crm.js').endPoint;
const Q = require("q");

function _service(context){ this.context = context; }

_service.prototype.createOnlineEventRegistration =  function(eventId, eventReg){
	const deferred = Q.defer();
	const failureRes = {
		errorMessage : "Fail to create online donation transaction",
		developerErrorMessage : "Fail to create online donation transaction"
	};
	
    let createOnlineEventRegistrationEndPoint = ERP_ENDPOINT.createOnlineEventRegistration;
    createOnlineEventRegistrationEndPoint = createOnlineEventRegistrationEndPoint.replace("{eventID}", eventId)

    const _reqParam = {
        endpoint: createOnlineEventRegistrationEndPoint,
        jsonData: eventReg,
        context: this.context
    }
	
	console.log(">>> createOnlineEventRegistration")

	apigw.post(_reqParam)
		.then((response) => {
			console.log(">>>>> event-service")
			console.log(".then((response) => {")
			console.log(response)
			if (response.statusCode < 400) {
				if (response.body.Success){
					deferred.resolve(response.body);
				} else {
					failureRes["developerErrorMessage"] = "[APIGW-ERROR] " + response.body.Remarks;
					deferred.reject(failureRes)
				}
			} else {
				failureRes["developerErrorMessage"] = "[APIGW-ERROR] " + JSON.stringify(response.body);
				deferred.reject(failureRes)
			}
		})
		.fail((error) => {
			console.log(">>>>> event-service")
			console.log(".fail((error) => {")
			console.log(error)
			deferred.reject(failureRes)
		});
    
	return deferred.promise;
}

module.exports = _service;
