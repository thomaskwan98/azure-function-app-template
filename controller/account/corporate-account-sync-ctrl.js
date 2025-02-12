'use strict';
const logger = rootRequire('config/logger');
var Q = require("q");

const accountService = rootRequire('service/account-service.js');
const commonService = rootRequire('service/common-service');

var _corpAcctSyncBatch = (req,res) => {
	var context = {req:req,res:res};
	var _acctService = (new accountService(context));
	const comService = new commonService(context);
	var crmCorporateAccounts = req.body;
	var operationMessage = [];
	// operationFlg


	var notNull = function(obj){
		return obj != null 
				&& obj != "" 
				&& typeof obj !== 'undefined';
	}


	function getPromise(crmAccount){
		return function () {
			var operationFlg = "retrieveCorporateAccount";
			var mid;
			if(typeof crmAccount.MasterCustomerID !== 'undefined'){
				mid = crmAccount.MasterCustomerID;
			}else{
				mid = "";
			}

			var vemAccount = {};
			vemAccount.MasterCustomerID = mid;
			vemAccount.Name = crmAccount.AccountName;
			vemAccount.PreviousName = crmAccount.PreviousCompanyName;
			vemAccount.BRNumber = crmAccount.BusinessRegistration;
			vemAccount.Status = crmAccount.Status;
			vemAccount.BillingAddress1 = crmAccount.BRAddress1;
			vemAccount.BillingAddress2 = crmAccount.BRAddress2;
			vemAccount.BillingAddress3 = crmAccount.BRAddress3;
			vemAccount.BillingAddressCountry = crmAccount.BRAddressCountry;

			var countryNames = [];

			if (notNull(vemAccount.BillingAddressCountry)){
					countryNames[countryNames.length] = vemAccount.BillingAddressCountry;
			}

			var deferred = Q.defer();
			var result = null;

			comService.convertCountryNameToCode(countryNames, 3)
				.then((countryCodes) => {
					const failureRes = {
						errorMessage : "Fail to retrieve CountryCode",
						developerErrorMessage : "Fail to retrieve CountryCode"
					};
					if(notNull(vemAccount.BillingAddressCountry) && !notNull(countryCodes[vemAccount.BillingAddressCountry])){
						result={};
						result.Success = false;
						result.Message = "No country name mapping found for BillingAddressCountry '"+vemAccount.BillingAddressCountry+"'";
						result.ExportedSystem = "VEM";
						result.MasterCustomerID = mid;
						deferred.resolve(result);						
					}
					else{
						vemAccount.BillingAddressCountry = countryCodes[vemAccount.BillingAddressCountry];
						_acctService.retrieveVemAccount(mid)
							.then((response) => {
								if (response.Success) {
									// operationFlg
									operationFlg = "updateCorporateAccount";

									// if exist, update this Corporate Account
									return _acctService.updateVemAccount(vemAccount);
								} else {
									// operationFlg
									operationFlg = "createCorporateAccount";

									// if not exist, create a new Corporate Account
									return _acctService.createVemAccount(vemAccount);
								}
							}).then((response) => {
								result={};
								result.Success = true;
								result.Message = response.Message;
								result.ExportedSystem = "VEM";
								result.MasterCustomerID = mid;
								deferred.resolve(result)
							}).fail((error) => {
								result={};
								result.Success = false;
								result.Message = error.developerErrorMessage;
								result.ExportedSystem = "VEM";
								result.MasterCustomerID = mid;
								deferred.resolve(result);
							})
					}
				}).fail((failureRes) => {
					deferred.reject(failureRes);
				});

			var deferred = Q.defer();
			var result = null;

			return deferred.promise;
		}
	}

	for (var i = 0; i < crmCorporateAccounts.length; i++) {
		var crmAccount = crmCorporateAccounts[i];
		operationMessage.push(getPromise(crmAccount));
	}

	Q.allSettled(operationMessage.map(function (func) { return func(); }))
	.spread(function () {
		var result = [];
		for(var arg in arguments){
			result.push(arguments[arg].value)
		}
		res.status(200).send(result);
	}).done();
}

module.exports = {
	syncAccounts: _corpAcctSyncBatch
}
