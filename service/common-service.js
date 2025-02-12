'use strict';
const apigw = rootRequire('utility/network-apigw');
const logger = rootRequire('utility/logger');
const CRM_ENDPOINT = rootRequire('config/crm.js').endPoint;
const Q = require("q");

function _service(context){ this.context = context; }

_service.prototype.personalAccountAssurance = function(acctMaster) {
	const deferred = Q.defer();
	const failureRes = {
		errorMessage : "Fail to assure the existance of the account record",
		developerErrorMessage : "Fail to assure the existance of the account record"
	};

    const _reqParam = {
        endpoint: CRM_ENDPOINT.personalAccountAssurance,
        jsonData: acctMaster,
        context: this.context
    }

	apigw.post(_reqParam)
		.then((response) => {
			if (response.statusCode < 400) {
				if (response.body.Success){
					logger.debug(">>> com-ser response.body", response.body);
					deferred.resolve(response.body);
				} else {
					logger.debug(">>> com-ser response.body.Remarks", response.body.Remarks)
					failureRes["developerErrorMessage"] = "[APIGW-ERROR] " + response.body.Remarks;
					deferred.reject(failureRes)
				}
			} else {
				logger.debug(">>> com-ser response.body.developer_message", response.body.developer_message);
				failureRes["developerErrorMessage"] = "[APIGW-ERROR] " + JSON.stringify(response.body.developer_message);
				deferred.reject(failureRes)
			}
		})
		.fail((error) => {
			deferred.reject(failureRes)
		});
    
	return deferred.promise;
}

_service.prototype.getCountryCodeMapping_Internal = function() {
	const deferred = Q.defer();
	const failureRes = {
		errorMessage : "Fail to retrieve CountryCode",
		developerErrorMessage : "Fail to retrieve CountryCode"
	};
    
     // ca path
	var endPoint = "/internal/services/countries";
    const _reqParam = {
        endpoint: endPoint,
        context: this.context
    }
        console.log("--[debug][service file] req jsonData", _reqParam); // Kelvin 2022-01-18
	//console.log(_reqParam.jsonData)

	if(global.cache.countryList.lastUpdate==0 || new Date().getTime()-global.cache.countryList.lastUpdate>86400){
		apigw.get(_reqParam)
			.then((response) => {
				console.log("--[debug][service file] country mapping response", response) // Kelvin 2022-01-18
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
						global.cache.countryList.content = result;
						global.cache.countryList.lastUpdate = new Date().getTime();
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
	}
	else{
		deferred.resolve(global.cache.countryList.content);
	}

    return deferred.promise;
	
}

_service.prototype.convertCountryCodeToName = function(countryCodes) {
	const deferred = Q.defer();
	const failureRes = {
		errorMessage : "Fail to retrieve CountryName",
		developerErrorMessage : "Fail to retrieve CountryName"
	};
	let countryNames = {};
	this.getCountryCodeMapping_Internal().then((response) => {
		let resLength = response.Body.length;
		if (resLength != 0) {

			let countries = response.Body;

			countryCodes.forEach(function(countryCode){
				for(let i in countries){
					if((countries[i].CountryCode2 && countries[i].CountryCode2.toUpperCase()==countryCode.toUpperCase()) || (countries[i].CountryCode3 && countries[i].CountryCode3.toUpperCase()==countryCode.toUpperCase())){
						countryNames[countryCode] = countries[i].CountryName;
						console.log(countryCode+":"+countryNames[countryCode]);
						break;
					}
				}
			});

			deferred.resolve(countryNames);
		} else {
			deferred.reject(failureRes);
		}
	})
	.fail((error) => {
		deferred.reject(failureRes)
	});

	return deferred.promise;
}

_service.prototype.convertCountryNameToCode = function(countryNames, digits) {
	const deferred = Q.defer();
	const failureRes = {
		errorMessage : "Fail to retrieve CountryCode",
		developerErrorMessage : "Fail to retrieve CountryCode"
	};
	let countryCodes = {};
	this.getCountryCodeMapping_Internal().then((response) => {
		
		let resLength = response.Body.length;

		if (resLength != 0) {
			let countries = response.Body;
			countryNames.forEach(function(countryName){
				for(let i in countries){
					if(countries[i].CountryName.toUpperCase()==countryName.toUpperCase()){
						if(digits==2)
							countryCodes[countryName] = countries[i].CountryCode2;
						else
							countryCodes[countryName] = countries[i].CountryCode3;
					}
				}
			});

			deferred.resolve(countryCodes);
		} else {
			deferred.reject(failureRes);
		}
	})
	.fail((error) => {
		deferred.reject(failureRes)
	});

	return deferred.promise;
}

_service.prototype.mapCountries = function(inCountries, digits) {
	const deferred = Q.defer();
	let failureRes = {
		errorMessage : "Fail to retrieve CountryCode",
		developerErrorMessage : "Fail to retrieve CountryCode"
	};
	let outCountries = {};

	if (digits!=2 && digits!=3){
		failureRes = {
			errorMessage : "Fail to retrieve CountryName",
			developerErrorMessage : "Fail to retrieve CountryName"
		};
	}

	this.getCountryCodeMapping_Internal().then((response) => {
		
		let resLength = response.Body.length;

		if (resLength != 0) {
			let countries = response.Body;
			inCountries.forEach(function(country){
				for(let i in countries){
					if(countries[i].CountryName.toUpperCase()==country.toUpperCase() || 
					(countries[i].CountryCode2 && countries[i].CountryCode2.toUpperCase()==country.toUpperCase()) || 
					(countries[i].CountryCode3 && countries[i].CountryCode3.toUpperCase()==country.toUpperCase())){
						if(digits==2){
							outCountries[country] = countries[i].CountryCode2;
						}else if(digits==3){
							outCountries[country] = countries[i].CountryCode3;
						}else{
							outCountries[country] = countries[i].CountryName;
						}
						break;
					}
				}
			});

			deferred.resolve(outCountries);
		} else {
			deferred.reject(failureRes);
		}
	})
	.fail((error) => {
		deferred.reject(failureRes)
	});

	return deferred.promise;
}

// API-S 2017/9/18
_service.prototype.checkPAExistanceAndNewsSubscription = function(Email, ENewsInstance) {
	const deferred = Q.defer();
	const failureRes = {
		errorMessage : "Fail to Check Customer Existence and Newsletter Subscription",
		developerErrorMessage : "Fail to Check Customer Existence and Newsletter Subscription"
	};

    const _reqParam = {
        endpoint: CRM_ENDPOINT.checkPAExistanceAndNewsSubscription,
        jsonData: { 
			Email,
			ENewsInstance
		},
        context: this.context
    }

	apigw.post(_reqParam)
		.then((response) => {
			if (response.statusCode < 400) {
				logger.debug(">>> com-ser response.body", response.body);
				deferred.resolve(response.body);
			} else {
				logger.debug(">>> com-ser response.body.developer_message", response.body.developer_message);
				failureRes["developerErrorMessage"] = "[APIGW-ERROR] " + JSON.stringify(response.body.developer_message);
				deferred.reject(failureRes)
			}
		})
		.fail((error) => {
			deferred.reject(failureRes)
		});
    
	return deferred.promise;
}
// API-E 2017/9/18

module.exports = _service;
