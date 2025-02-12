'use strict';
const logger = rootRequire('config/logger');
const accountService = rootRequire('service/account-service');
const commonService = rootRequire('service/common-service');
var Q = require("q");

// convert result using master table and ExtSysRef table
var jsonDoubleC = (body1,body2) => {
 	var ret = {
		 // body2.MasterCustomerID
		 "MasterCustomerID": body1.MasterCustomerID,
   		 "AccountName": body1.AccountName,			
		 // body1.PreviousCompanyNameFormerlyKnownAs		
  		 "PreviousCompanyNameFormerlyKnownAs": body1.PreviousCompanyNameFormerlyKnownAs,
  		 "BusinessRegistration": body1.BusinessRegistration,
		 // body1.Status		
   		 "Status": body1.Status,		
		 // body1.BRAddress1			
  		 "BRAddress1": body1.BRAddress1,		
		 // body1.BRAddress2
   		 "BRAddress2": body1.BRAddress2,
		 // body1.BRAddress3	
   		 "BRAddress3": body1.BRAddress3,
		 // body1.BRAddressCountry
  		 "BRAddressCountry": body1.BRAddressCountry,		
   		 "BillingContactName": body2.BillingContactName,			
   		 "BillingContactEmail": body2.BillingContactEmail,			
   		 "BillingAddress1": body2.BillingAddress1,			
  		 "BillingAddress2": body2.BillingAddress2,			   				
		 "BillingAddress3": body2.BillingAddress3,			
   		 "BillingAddressCountry": body2.BillingAddressCountry,			
		 "BillingContactPhone": body2.BillingContactPhone,			
   		 "BillingContactFax":body2.BillingContactFax								
	};
    return ret;	
}

// convert result using master table
var jsonSingleC = (body1) => {
	var ret = {
		// body2.MasterCustomerID		
		"MasterCustomerID": body1.MasterCustomerID,	
		"AccountName": body1.AccountName,			
		// body1.PreviousCompanyNameFormerlyKnownAs
		"PreviousCompanyNameFormerlyKnownAs": body1.PreviousCompanyNameFormerlyKnownAs,
		"BusinessRegistration": body1.BusinessRegistration,	
		// body1.Status		
   		 "Status": body1.Status,	
		// body1.BRAddress1				
		"BRAddress1": body1.BRAddress1,
		// body1.BRAddress2,	
		"BRAddress2": body1.BRAddress2,		
		// body1.BRAddress3,		
		"BRAddress3": body1.BRAddress3,	
		// body1.BRAddressCountry
		"BRAddressCountry": body1.BRAddressCountry,		
		"BillingContactName": body1.PrimaryContact,			
		"BillingContactEmail": body1.PrimaryContactEmail,			
		"BillingAddress1": body1.BillingAddress1,			
		"BillingAddress2": body1.BillingAddress2,			
		"BillingAddress3": body1.BillingAddress3,			
		"BillingAddressCountry": body1.BillingAddressCountry,			
		"BillingContactPhone": body1.PrimaryContactPhone,			
		"BillingContactFax":body1.PrimaryContactFax							   			    		
	};
	return ret;			   
}

var notNull = function(obj){
	return obj != null 
			&& obj != "" 
			&& typeof obj !== 'undefined';
}

module.exports = {
	// API-S 2017/3/23
	// updateCorporateAccountMaster
	updateCorporateAccountMaster: (req, res) => {
		// requst response
		const context = { req, res };
		// requst Body
		const reqBody = req.body;
		// get params from request path
		var resPath = req.originalUrl;
		var masterCustomerID = resPath.replace("/crm/accounts/corporates/", "");

		// accService
		const accService = new accountService(context);
		const comService = new commonService(context);

		var countryInputs = [];
		if (notNull(reqBody.BillingAddressCountry)){
				countryInputs[countryInputs.length] = reqBody.BillingAddressCountry;
		}
		if (notNull(reqBody.BRAddressCountry)){
				countryInputs[countryInputs.length] = reqBody.BRAddressCountry;
		}

		comService.mapCountries(countryInputs)
			.then((countryNames) => {
				const failureRes = {
					errorMessage : "Fail to retrieve CountryName",
					developerErrorMessage : "Fail to retrieve CountryName"
				};
				const deferred = Q.defer();
				if(reqBody.SystemSourceKey=="VEM"){
					if(notNull(reqBody.BRAddressCountry) && !notNull(countryNames[reqBody.BRAddressCountry])){
						failureRes.developerErrorMessage = "No country name mapping found for BRAddressCountry '" + reqBody.BRAddressCountry + "'"
						deferred.reject(failureRes);
					} else if(notNull(reqBody.BillingAddressCountry) && !notNull(countryNames[reqBody.BillingAddressCountry])){
						failureRes.developerErrorMessage = "No country name mapping found for BillingAddressCountry '" + reqBody.BillingAddressCountry + "'"
						deferred.reject(failureRes);		
					} else {
						if(notNull(reqBody.BillingAddressCountry))
							reqBody.BillingAddressCountry = countryNames[reqBody.BillingAddressCountry];
						if(notNull(reqBody.BRAddressCountry))
							reqBody.BRAddressCountry = countryNames[reqBody.BRAddressCountry];
						deferred.resolve();											
					}
				}
				else
					deferred.resolve();	
				return deferred.promise;
			})
			.then(() => {
				// Internal Update CRM Corporate Account
				var reqBody4AccMaster = 
				{
					// "MasterCustomerID": "", add the field geting from path in the ca.
					"AccountName": reqBody.AccountName,
					"BusinessRegistration": reqBody.BusinessRegistration,
					"Status": reqBody.Status,
			// error-> call CRM Service error using the blow column
					"BRAddress1": reqBody.BRAddress1,
					"BRAddress2": reqBody.BRAddress2,
					"BRAddress3": reqBody.BRAddress3,
					"BRAddressCountry": reqBody.BRAddressCountry
					// "BillingAddress1": reqBody.BillingAddress1, //Remove by Aman-20170408
					// "BillingAddress2": reqBody.BillingAddress2, //Remove by Aman-20170408
					// "BillingAddress3": reqBody.BillingAddress3, //Remove by Aman-20170408
					// "BillingAddressCountry": reqBody.BillingAddressCountry //Remove by Aman-20170408
				};

				// Upsert CRM Corporate Account External System Reference
				var reqBody4AcctExtSysRef = 
				{
					// "MasterCustomerID": "", add the field geting from path
					"SystemSourceKey": reqBody.SystemSourceKey,
					"BillingContactName": reqBody.BillingContactName,
					"BillingContactEmail": reqBody.BillingContactEmail,
					"BillingAddress1": reqBody.BillingAddress1,
					"BillingAddress2": reqBody.BillingAddress2,
					"BillingAddress3": reqBody.BillingAddress3,
					"BillingAddressCountry": reqBody.BillingAddressCountry,
					"BillingContactPhone": reqBody.BillingContactPhone,
					"BillingContactFax": reqBody.BillingContactFax
				};

				// updateCorporateAccountMaster
				// set accMaster
				var accMaster ={};
				accMaster.reqBody4AccMaster = reqBody4AccMaster;
				accMaster.path4MasterCustomerID = masterCustomerID;
				accService
					.updateCorporateAccountMaster(accMaster)
					.then((response) => {
						// set acctExtSysRef
						var acctExtSysRef ={};
						acctExtSysRef.reqBody4AcctExtSysRef = reqBody4AcctExtSysRef;
						acctExtSysRef.path4MasterCustomerID = masterCustomerID;
						return accService.upsertCorporateAccountExtSysRef(acctExtSysRef);
					})
					.then((response) => {
						// response 200
						res.status(200).send(response.Body);
					}).fail((error) => {
						// console.log(error);
						// response 400
						res.status(400).send(error);
					});	
			})
			.fail((error) => {
				console.log(error);
				// response 400
				res.status(400).send(error);
			});
	},

	// createCorporateAccountMaster
	createCorporateAccountMaster: (req, res) => {
		// requst response
		const context = { req, res };
		// requst Body
		const requstBody = req.body;
		// accService
		const accService = new accountService(context);
		const comService = new commonService(context);

			// accountName
		const accountName = requstBody.AccountName;

		// Internal Retrieve CRM Corporate Account
		var reqBody4Retrieve = 
			{
				"AccountName": requstBody.AccountName,
				// Internal Retrieve CRM Corporate Account with “BusinessRegistration” field added in message body
				"BusinessRegistration": requstBody.BusinessRegistration
			};
		
		// Internal Create CRM Corporate Account
		var reqBody4AccMaster = 
			{
				"AccountName": requstBody.AccountName,
				"BusinessRegistration": requstBody.BusinessRegistration,
				"Status": requstBody.Status,
		// error-> call CRM Service error using the blow column
				"BRAddress1": requstBody.BRAddress1,
				"BRAddress2": requstBody.BRAddress2,
				"BRAddress3": requstBody.BRAddress3,
				"BRAddressCountry": requstBody.BRAddressCountry,
				// "BillingAddress1": requstBody.BillingAddress1,
				// "BillingAddress2": requstBody.BillingAddress2,
				// "BillingAddress3": requstBody.BillingAddress3,
				// "BillingAddressCountry": requstBody.BillingAddressCountry,
				// set false according to WS_001' Mandatory column
				"Media": false
			}

		// Upsert CRM Corporate Account External System Reference
		var reqBody4AcctExtSysRef = 
		{
			// "MasterCustomerID": "",
			"SystemSourceKey": requstBody.SystemSourceKey,
			"BillingContactName": requstBody.BillingContactName,
			"BillingContactEmail": requstBody.BillingContactEmail,
			"BillingAddress1": requstBody.BillingAddress1,
			"BillingAddress2": requstBody.BillingAddress2,
			"BillingAddress3": requstBody.BillingAddress3,
			"BillingAddressCountry": requstBody.BillingAddressCountry,
			"BillingContactPhone": requstBody.BillingContactPhone,
			"BillingContactFax": requstBody.BillingContactFax
		};

		// Update CRM Corporate Account
		var reqBody4AcctMaster = requstBody;

		// operateFlag
		var operateFlag = "";

		// call retrieveCorporateAccountMaster
		accService
		.retrieveCorporateAccountMaster(reqBody4Retrieve)
		.then((response) => {
			if (response.Success) {
				// operateFlag
				operateFlag = "updateCorporateAccountMaster4Ca";
				// set accMaster
				var accMaster ={};
				accMaster.reqBody4AcctMaster = reqBody4AcctMaster;
				// accMaster.path4MasterCustomerID = response.Body.MasterCustomerID;
			// error-> call CRM Service error using the blow column
				accMaster.path4MasterCustomerID = response.Body.MasterCustomerID;
				return accService.updateCorporateAccountMaster4Ca(accMaster);
			} else {
				// operateFlag
				operateFlag = "createCorporateAccountMaster";

				var countryInputs = [];
				if (notNull(reqBody4AcctExtSysRef.BillingAddressCountry)){
						countryInputs[countryInputs.length] = reqBody4AcctExtSysRef.BillingAddressCountry;
				}
				if (notNull(reqBody4AccMaster.BRAddressCountry)){
						countryInputs[countryInputs.length] = reqBody4AccMaster.BRAddressCountry;
				}

				const deferred = Q.defer();

				comService.mapCountries(countryInputs)
					.then((countryNames) => {
						const failureRes = {
							errorMessage : "Fail to retrieve CountryName",
							developerErrorMessage : "Fail to retrieve CountryName"
						};
						if(requstBody.SystemSourceKey=="VEM"){
							if(notNull(reqBody4AccMaster.BRAddressCountry) && !notNull(countryNames[reqBody4AccMaster.BRAddressCountry])){
								failureRes.developerErrorMessage = "No country name mapping found for BRAddressCountry '" + reqBody4AccMaster.BRAddressCountry + "'"
								deferred.reject(failureRes);
							} else if(notNull(reqBody4AcctExtSysRef.BillingAddressCountry) && !notNull(countryNames[reqBody4AcctExtSysRef.BillingAddressCountry])){
								failureRes.developerErrorMessage = "No country name mapping found for BillingAddressCountry '" + reqBody4AcctExtSysRef.BillingAddressCountry + "'"
								deferred.reject(failureRes);
							} else {
								if(notNull(reqBody4AcctExtSysRef.BillingAddressCountry)){
									reqBody4AcctExtSysRef.BillingAddressCountry = countryNames[reqBody4AcctExtSysRef.BillingAddressCountry];
								}
								if(notNull(reqBody4AccMaster.BRAddressCountry))
									reqBody4AccMaster.BRAddressCountry = countryNames[reqBody4AccMaster.BRAddressCountry];
								return accService.createCorporateAccountMaster(reqBody4AccMaster);											
							}
						}
						else
							return accService.createCorporateAccountMaster(reqBody4AccMaster);	
					})
					.then((response) => {
						deferred.resolve(response);
					}).fail((error) => {
						deferred.reject(error);
					});	

				return deferred.promise;
			}
		}).then((response) => {
			// check
			if(operateFlag == "updateCorporateAccountMaster4Ca"){
				var d = Q.defer();
				d.resolve(response)
				return d.promise;
			} else if(operateFlag == "createCorporateAccountMaster"){
				// create fail. this record exist.
				if (response.Success) {
					// set acctExtSysRef
					var acctExtSysRef ={};
					acctExtSysRef.reqBody4AcctExtSysRef = reqBody4AcctExtSysRef;
					acctExtSysRef.path4MasterCustomerID = response.Body.MasterCustomerID;
					return accService.upsertCorporateAccountExtSysRef(acctExtSysRef);
				} else {
					// This group name is already existed in the system
					// set accMaster
					var accMaster ={};
					accMaster.reqBody4AcctMaster = reqBody4AcctMaster;
					// accMaster.path4MasterCustomerID = response.Body.MasterCustomerID;
					accMaster.path4MasterCustomerID = response.MasterCustomerID;
					return accService.updateCorporateAccountMaster4Ca(accMaster);
				}
			}
		}).then((response) => {
			// response 200
			res.status(200).send(response.Body);
		}).fail((error) => {
			// console.log(error);
			// response 400
			res.status(400).send(error);
		});	

	},
	// retrieveCorporateAccountMaster
	retrieveCorporateAccountMaster: (req, res) => {
		const context = { req, res };

		// get params from request path
		const resPath = req.path;
		const masterCustomerId = resPath.replace("/accounts/corporates/", "");		
		const systemSourceKey = req.query.SystemSourceKey;
		const CountryCodes = req.query.CountryCodes;
		const accService = new accountService(context);
		const comService = new commonService(context);

        // corporateAccount Master table info
		var ret ={};
		// sskFlag exist flg
		var sskFlag = true;
		// return result
		var result = {};

		// Internal Retrieve CRM Corporate Account
		var reqBody4Retrieve = 
			{
				"MasterCustomerId": masterCustomerId
			};

		// retrieveCorporateAccountMaster
		accService
			.retrieveCorporateAccountMaster(reqBody4Retrieve)
			.then((response) => {
				 // corporateAccount Master table info
				ret = response.Body;
				if (response.Success) {
					// systemSourceKey is not empty
					if (typeof systemSourceKey !== 'undefined' && systemSourceKey!= "" && systemSourceKey != null) {
						// retrieveCorporateAccountExtSysRef
						// =>/internal/crm/accounts/corporates/{mid}/external-system-refs/{SystemSourceKey}
						return accService.retrieveCorporateAccountExtSysRef(masterCustomerId,systemSourceKey);
					} else {
						// sskFlag exist flg
						sskFlag = false;

						// return promise
						const deferred = Q.defer();
						deferred.resolve(ret)
						return deferred.promise;
					} 											
				} else {
					// return promise
					const deferred = Q.defer();
					deferred.reject(ret);
					return deferred.promise;
				}
			})
			.then((response) => {
				// systemSourceKey exist 
				if(sskFlag){
					// CorporateAccountExtSysRef table info
        			var ret2 = response.Body;
					// convert result using master table and ExtSysRef table
					result = jsonDoubleC(ret,ret2);
				}else {
					// convert result using master table
					result = jsonSingleC(response);
				}

				var countryNames = [];
				if (notNull(result.BillingAddressCountry)){
						countryNames[countryNames.length] = result.BillingAddressCountry;
				}
				if (notNull(result.BRAddressCountry)){
						countryNames[countryNames.length] = result.BRAddressCountry;
				}

				return comService.convertCountryNameToCode(countryNames, 2);
			})
			.then((countryCodes) => {
				const failureRes = {
					errorMessage : "Fail to retrieve CountryCode",
					developerErrorMessage : "Fail to retrieve CountryCode"
				};
				if((notNull(result.BillingAddressCountry) && !notNull(countryCodes[result.BillingAddressCountry])) || 
					(notNull(result.BRAddressCountry) && !notNull(countryCodes[result.BRAddressCountry]))){
					const deferred = Q.defer();
					deferred.reject(failureRes);
					return deferred.promise;					
				}
				else{
					if(notNull(result.BillingAddressCountry))
						result["BillingAddressCountry"] = countryCodes[result.BillingAddressCountry];
					if(notNull(result.BRAddressCountry))
						result["BRAddressCountry"] = countryCodes[result.BRAddressCountry];
					res.status(200).send(result);
				}
			})		
			.fail((error) => {
				console.log(error);
				// response 400
				res.status(400).send(error);
			});
	}
	// API-E 2017/3/23
}
