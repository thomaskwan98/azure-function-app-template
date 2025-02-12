'use strict';
const apigw = rootRequire('utility/network-apigw');
const logger = rootRequire('utility/logger');
const CRM_ENDPOINT = rootRequire('config/crm.js').endPoint;
const Q = require("q");

function _service(context){ this.context = context; }

_service.prototype.retrievePersonalAccountMaster = function(MasterCustomerID, Email) {
	const deferred = Q.defer();
	const failureRes = {
		"errorMessage" : "Fail to retrieve account record",
		"developerErrorMessage" : "Fail to retrieve account record"
	};
	
    const _reqParam = {
        endpoint: CRM_ENDPOINT.retrievePersonalAccountMaster,
        jsonData: { 
			MasterCustomerID: MasterCustomerID
				? MasterCustomerID 
				: "", 
			Email 
		},
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



_service.prototype.createPersonalAccountMaster = function(personalAccount) {
	const deferred = Q.defer();
	const failureRes = {
		errorMessage : "Fail to create account",
		developerErrorMessage : "Fail to create account"
	};

    const _reqParam = {
        endpoint: CRM_ENDPOINT.createPersonalAccountMaster,
        jsonData: personalAccount,
        context: this.context
    }
    
	apigw.post(_reqParam)
		.then((response) => {
			console.log(">>>>> account-service")
			console.log(">>> apigw.post(_reqParam)")
			console.log(response.body)
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

// API-S 2017/9/18
// updatePersonalAccountMaster method
_service.prototype.updatePersonalAccountMaster = function(personalAccount) {
	const deferred = Q.defer();
	const failureRes = {
		errorMessage : "Fail to update account",
		developerErrorMessage : "Fail to update account"
	};

    const _reqParam = {
        endpoint: CRM_ENDPOINT.updatePersonalAccountMaster,
        jsonData: personalAccount,
        context: this.context
    }
    
	apigw.put(_reqParam)
		.then((response) => {
			console.log(">>>>> account-service")
			console.log(">>> apigw.post(_reqParam)")
			console.log(response.body)
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
// API-E 2017/9/18

// API-S 2017/3/23
// updateCorporateAccountMaster method
_service.prototype.updateCorporateAccountMaster = function(acctMaster) {
	const deferred = Q.defer();
	// fail error message
	const failureRes = {
		errorMessage : "Fail to update corporate account record",
		developerErrorMessage : "Fail to update corporate account record"
	};

	// replace the ca path's "{mid}" with MasterCustomerID value
	var endPoint = CRM_ENDPOINT.updateCorporateAccountMaster
		.replace("{mid}", acctMaster.path4MasterCustomerID);
    
	// set request ca params
    const _reqParam = {
        endpoint: endPoint,
        jsonData: acctMaster.reqBody4AccMaster,
        context: this.context
    }
    
	console.log(_reqParam.jsonData)

	// call ca -> Internal Update CRM Corporate Account
	apigw.put(_reqParam)
		.then((response) => {
			// response result
			var result = {}; 
			// response success
			if (response.statusCode < 400) {
				result.Success = true;
				result.Body = response.body;
				deferred.resolve(result);
			} else {
				// errorMessage
                var errorCode = response.body.error_code;
                errorCode = errorCode ? errorCode : response.statusCode
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

// upsertCorporateAccountExtSysRef method
_service.prototype.upsertCorporateAccountExtSysRef = function(acctExtSysRef) {
	const deferred = Q.defer();
	// fail error message
	const failureRes = {
		errorMessage : "Fail to update corporate account record",
		developerErrorMessage : "Fail to update corporate account record"
	};

	// replace the ca path's "{mid}" with MasterCustomerID value
	var endPoint = CRM_ENDPOINT.upsertCorporateAccountExtSysRef
			.replace("{mid}", acctExtSysRef.path4MasterCustomerID);
    
	// set request ca params
    const _reqParam = {
        endpoint: endPoint,
        jsonData: acctExtSysRef.reqBody4AcctExtSysRef,
        context: this.context
    }
    
	console.log(_reqParam.jsonData)
	// call ca -> Upsert CRM Corporate Account External System Reference
	apigw.post(_reqParam)
		.then((response) => {
			// response result
			var result = {}; 
			// response success
			if (response.statusCode < 400) {
				result.Success = true;
				result.Body = response.body;
				deferred.resolve(result);
			} else {
				// errorMessage
                var errorCode = response.body.error_code;
                errorCode = errorCode ? errorCode : response.statusCode
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

// createCorporateAccountMaster methode
_service.prototype.createCorporateAccountMaster = function(acctMaster) {
	const deferred = Q.defer();
	// fail error message
	const failureRes = {
		errorMessage : "Fail to retrieve account record",
		developerErrorMessage : "Fail to retrieve account record"
	};
    
	// set request ca params
    const _reqParam = {
        endpoint: CRM_ENDPOINT.createCorporateAccountMaster,
        jsonData: acctMaster,
        context: this.context
    }
    
	console.log(_reqParam.jsonData)

	// call ca -> Internal Create CRM Corporate Account
	apigw.post(_reqParam)
		.then((response) => {
			// response result
			var result = {}; 
			// response success
			if (response.statusCode < 400) {
				result.Success = true;
				result.Body = response.body;
				deferred.resolve(result);
			} else {
				// errorMessage
				var errorMessage = response.body.developer_message;
				// This group name is already existed in the system
				// errorMessage = (errorMessage == undefined)?"":errorMessage;
				if (errorMessage.indexOf("This group name is already existed in the system.") > -1 ) {
					result.Success = false;
					result.MasterCustomerID = response.body.enduser_message;
					result.Body = errorMessage;
					deferred.resolve(result);
				} else {
					// errorMessage
					var errorCode = response.body.error_code;
					errorCode = errorCode ? errorCode : response.statusCode
					var errorMsg = response.body.developer_message;
					errorMsg = errorMsg ? errorMsg : JSON.stringify(response.body);
					failureRes["developerErrorMessage"] = "[APIGW-" + errorCode + "] " + errorMsg;
					deferred.reject(failureRes);
				}
			}
		})
		.fail((error) => {
			deferred.reject(failureRes)
		});
    
	return deferred.promise;
}

// retrieveCorporateAccountMaster methode
_service.prototype.retrieveCorporateAccountMaster = function(Mid) {
	const deferred = Q.defer();
	// fail error message
	const failureRes = {
		errorMessage : "Fail to retrieve account record",
		developerErrorMessage : "Fail to retrieve account record"
	};
    
	// set request ca params
    const _reqParam = {
        endpoint: CRM_ENDPOINT.retrieveCorporateAccountMaster,
        jsonData: Mid,
        context: this.context
    }
    
	console.log(_reqParam.jsonData);

	// call ca -> Internal Retrieve CRM Corporate Account
	apigw.post(_reqParam)
		.then((response) => {
			// response result
			var result = {}; 
			// response success
			if (response.statusCode < 400) {
				result.Success = true;
				result.Body = response.body;
				deferred.resolve(result);
			} else {
				// errorMessage
				var errorMessage = response.body.developer_message;
				failureRes["developerErrorMessage"] = "[APIGW-ERROR] " + errorMessage;
				// customer does not exist.
				if (errorMessage.indexOf("Customer does not exist.") > -1 ) {
					result.Success = false;
					result.Body = failureRes;
					deferred.resolve(result);
				} else {
					// errorMessage
					var errorCode = response.body.error_code;
					errorCode = errorCode ? errorCode : response.statusCode
					var errorMsg = response.body.developer_message;
					errorMsg = errorMsg ? errorMsg : JSON.stringify(response.body);
					failureRes["developerErrorMessage"] = "[APIGW-" + errorCode + "] " + errorMsg;
					deferred.reject(failureRes);
				}
			}
		})
		.fail((error) => {
			deferred.reject(failureRes)
		});
    
	return deferred.promise;
}

// updateCorporateAccountMaster4Ca method
_service.prototype.updateCorporateAccountMaster4Ca = function(acctMaster) {
	const deferred = Q.defer();
	// fail error message
	const failureRes = {
		errorMessage : "Fail to update corporate account record",
		developerErrorMessage : "Fail to update corporate account record"
	};

	// replace the ca path's "{mid}" with MasterCustomerID value
	var endPoint = CRM_ENDPOINT.updateCorporateAccountMaster4Ca
			.replace("{mid}", acctMaster.path4MasterCustomerID);
    
	// set request ca params
    const _reqParam = {
        endpoint: endPoint,
        jsonData: acctMaster.reqBody4AcctMaster,
        context: this.context
    }
    
	console.log(_reqParam.jsonData)

	// call ca -> Update CRM Corporate Account
	apigw.put(_reqParam)
		.then((response) => {
			// response result
			var result = {}; 
			// response success
			if (response.statusCode < 400) {
				result.Success = true;
				result.Body = response.body;
				deferred.resolve(result);
			} else {
				// errorMessage
                var errorCode = response.body.error_code;
                errorCode = errorCode ? errorCode : response.statusCode
                var errorMsg = response.body.developer_message;
                errorMsg = errorMsg ? errorMsg : JSON.stringify(response.body);
                // failureRes["developerErrorMessage"] = "[APIGW-" + errorCode + "] " + errorMsg;
				if (errorMsg.indexOf("[APIGW-ERROR]") > -1 ) {
					failureRes["developerErrorMessage"] = errorMsg;
				} else {
                	failureRes["developerErrorMessage"] = "[APIGW-" + errorCode + "] " + errorMsg;
				}
				deferred.reject(failureRes);
			}
		})
		.fail((error) => {
			deferred.reject(failureRes)
		});
    
	return deferred.promise;
}

// upsertPersonalAccountExtSysRef
_service.prototype.upsertPersonalAccountExtSysRef = function(acctExtSysRef) {
	const deferred = Q.defer();
	// fail error message
	const failureRes = {
		errorMessage : "Fail to create account",
		developerErrorMessage : "Fail to create account"
	};

	// replace the ca path's "{mid}" with MasterCustomerID value
	var endPoint = CRM_ENDPOINT.upsertPersonalAccountExtSysRef
			.replace("{mid}", acctExtSysRef.path4MasterCustomerID);

	// set request ca params
    const _reqParam = {
        endpoint: endPoint,
        jsonData: acctExtSysRef.reqBody4AcctExtSysRef,
        context: this.context
    }
    
	// call ca -> Upsert CRM Personal Account External System Reference
	apigw.post(_reqParam)
		.then((response) => {
			// response result
			var result = {}; 
			// response success
			if (response.statusCode < 400) {
				result.Success = true;
				result.Body = response.body;
				deferred.resolve(result);
			} else {
				// errorMessage
                var errorCode = response.body.error_code;
                errorCode = errorCode ? errorCode : response.statusCode
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

// retrieveCorporateAccountExtSysRef
_service.prototype.retrieveCorporateAccountExtSysRef = function(mid, SystemSourceKey) {
	const deferred = Q.defer();
	// fail error message
	const failureRes = {
		errorMessage : "Fail to retrieve account record",
		developerErrorMessage : "Fail to retrieve account record"
	};
    // replace the ca path's "{mid}" with MasterCustomerID value
	var endPointMin = CRM_ENDPOINT.retrieveCorporateAccountExtSysRef.replace("{mid}", mid);
	var endPoint = endPointMin.replace("{SystemSourceKey}", SystemSourceKey);

	// set request ca params
    const _reqParam = {
        endpoint: endPoint,
		//jsonData: { MasterCustomerID, Email },
        context: this.context
    }
    
	console.log(_reqParam.jsonData)

	apigw.get(_reqParam)
		.then((response) => {
			// response result
			var result = {}; 
			// response success
			if (response.statusCode < 400) {
				result.Success = true;
				result.Body = response.body;
				deferred.resolve(result);
			} else {
				// errorMessage
                var errorCode = response.body.error_code;
                errorCode = errorCode ? errorCode : response.statusCode
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


// retrievePersonalAccountExtSysRef
_service.prototype.retrievePersonalAccountExtSysRef = function(mid, SystemSourceKey) {
	const deferred = Q.defer();
	// fail error message
	const failureRes = {
		errorMessage : "Fail to retrieve account record",
		developerErrorMessage : "Fail to retrieve account record"
	};
     // replace the ca path's "{mid}" with MasterCustomerID value
	var endPointMin = CRM_ENDPOINT.retrievePersonalAccountExtSysRef.replace("{mid}", mid);
	var endPoint = endPointMin.replace("{SystemSourceKey}", SystemSourceKey);

	// set request ca params
    const _reqParam = {
        endpoint: endPoint,
		//jsonData: { MasterCustomerID, Email },
        context: this.context
    }
    
	console.log(_reqParam.jsonData)

	apigw.get(_reqParam)
		.then((response) => {
			// response result
			var result = {}; 
			// response success
			if (response.statusCode < 400) {
				result.Success = true;
				result.Body = response.body;
				deferred.resolve(result);
			} else {
				// errorMessage
                var errorCode = response.body.error_code;
                errorCode = errorCode ? errorCode : response.statusCode
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


// API-E 2017/3/15

_service.prototype.retrieveVemAccount = function(MasterCustomerID) {
	console.log("retrieveVemAccount:"+MasterCustomerID);
	const deferred = Q.defer();
	const failureRes = {
		errorMessage : "Fail to retrieve account record",
		developerErrorMessage : "Fail to retrieve account record"
	};
    
    const _reqParam = {
        endpoint: CRM_ENDPOINT.retrieveVEMAccount.replace("{mid}", MasterCustomerID),
        jsonData: {},
        context: this.context
    }
    var result = [];

	apigw.get(_reqParam)
		.then((response) => {
			// response result
			var result = {};
			var list = [];
			// response success
			console.log("retrieve:"+response.statusCode);
			if (response.statusCode < 400) {
				list = response.body;
				if (list.length > 0 ) {
					result.Success = true;
					result.Body = response.body;
					deferred.resolve(result);
				} else {
					// customer does not exist.
					result.Success = false;
					result.Body = "customer does not exist.";
					deferred.resolve(result);
				}
			} else {
				if (response.body.developer_message != null){
					// errorMessage
					var errorCode = response.body.error_code;
					errorCode = errorCode ? errorCode : response.statusCode
					var errorMsg = response.body.developer_message;
					errorMsg = errorMsg ? errorMsg : JSON.stringify(response.body);
					failureRes["developerErrorMessage"] = "[APIGW-" + errorCode + "] " + errorMsg;
					deferred.reject(failureRes);
				}else{
					deferred.reject(failureRes)
				}
			}
		})
		.fail((error) => {
			console.log("retrieve:"+error);
			deferred.reject(failureRes)
		});
    
	return deferred.promise;
}

_service.prototype.updateVemAccount = function(crmAccount) {
	console.log("Update VemAccount:"+crmAccount.MasterCustomerID);
	const deferred = Q.defer();
	const failureRes = {
		errorMessage : "Fail to update account record",
		developerErrorMessage : "Fail to update account record"
	};
    
    const _reqParam = {
        endpoint: CRM_ENDPOINT.updateVEMAccount.replace("{mid}", crmAccount.MasterCustomerID),
        jsonData: crmAccount,
        context: this.context
    }
    var result = [];

	apigw.put(_reqParam)
		.then((response) => {
			console.log("update:"+response.statusCode);
			// response result
			var result = {}; 
			// response success
			if (response.statusCode < 400) {
				result.Success = true;
				result.Body = response.body;
				result.Message = "Update VemAccount:"+crmAccount.MasterCustomerID+" success.";
				deferred.resolve(result);
			} else {
				if (response.body.developer_message != null){
					var errorCode = response.body.error_code;
					errorCode = errorCode ? errorCode : response.statusCode
					var errorMsg = response.body.developer_message;
					errorMsg = errorMsg ? errorMsg : JSON.stringify(response.body);
					failureRes["developerErrorMessage"] = "[APIGW-" + errorCode + "] " + errorMsg;
					deferred.reject(failureRes);
				}else{
					deferred.reject(failureRes)
				}
			}
		})
		.fail((error) => {
			console.log("update:"+error);
			deferred.reject(failureRes)
		});

	return deferred.promise;
}

_service.prototype.createVemAccount = function(crmAccount) {
	console.log("Create VemAccount:"+crmAccount.MasterCustomerID);
	const deferred = Q.defer();
	const failureRes = {
		errorMessage : "Fail to create account record",
		developerErrorMessage : "Fail to create account record"
	};
    
    const _reqParam = {
        endpoint: CRM_ENDPOINT.createVEMAccount,
        jsonData: crmAccount,
        context: this.context
    }
    var result = [];

	apigw.post(_reqParam)
		.then((response) => {
			console.log("create:"+response.statusCode);
			// response result
			var result = {}; 
			// response success
			if (response.statusCode < 400) {
				result.Success = true;
				result.Body = response.body;
				result.Message = "Create VemAccount:"+crmAccount.MasterCustomerID+" success.";
				deferred.resolve(result);
			} else {
				if (response.body.developer_message != null){
					var errorCode = response.body.error_code;
					errorCode = errorCode ? errorCode : response.statusCode
					var errorMsg = response.body.developer_message;
					errorMsg = errorMsg ? errorMsg : JSON.stringify(response.body);
					failureRes["developerErrorMessage"] = "[APIGW-" + errorCode + "] " + errorMsg;
					deferred.reject(failureRes);
				}else{
					deferred.reject(failureRes)
				}
			}
		})
		.fail((error) => {
			console.log("create:"+error);
			deferred.reject(failureRes)
		});
    
	return deferred.promise;
}

_service.prototype.CountryCodeMapping_Internal = function(BillingAddressCountry,CountryName) {
	const deferred = Q.defer();
	const failureRes = {
		errorMessage : "Fail to retrieve CountryCode",
		developerErrorMessage : "Fail to retrieve CountryCode"
	};
    
     // ca path
	var endPoint = "/internal/services/countries?CountryName="+BillingAddressCountry;
    const _reqParam = {
        endpoint: endPoint,
        context: this.context
    }
    
	console.log(_reqParam.jsonData)

	apigw.get(_reqParam)
		.then((response) => {
			// response result
			var result = {}; 
			// response success
			if (response.statusCode < 400) {
				result.Success = true;
				result.Body = response.body;
				if (result.Body.length == 0) {
					// errorMessage
					var errorCode = response.body.error_code;
					errorCode = errorCode ? errorCode : response.statusCode
					var errorMsg =  "No country code mapping found for " + CountryName + 
						" " + BillingAddressCountry;
					failureRes["developerErrorMessage"] = errorMsg;
					deferred.reject(failureRes);
				} else  {
					//return result
					deferred.resolve(result);
				}
			} else {
				// errorMessage
                var errorCode = response.body.error_code;
                errorCode = errorCode ? errorCode : response.statusCode
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
