'use strict';
const logger = rootRequire('utility/logger');
const accountService = rootRequire('service/account-service.js');
const commonService = rootRequire('service/common-service');
const Q = require("q");

// convert result using master table
var jsonSingleP = (body1) => {
	var phone=body1.Mobile;
    if (phone == "" || phone == null || typeof phone == 'undefined') {
		phone = body1.HomePhone;	
	  } 
 	var ret ={
   		 "MasterCustomerID": body1.MasterCustomerID,				
   		 "Email": body1.Email,				
   		 "FirstName": body1.FirstName,				
   		 "LastName": body1.LastName,
		 // body1.Status		
   		 "Status": body1.Status,		
   		 "BillingAddress1": body1.BillingAddress1,				
   		 "BillingAddress2": body1.BillingAddress2,					
   		 "BillingAddress3": body1.BillingAddress3,						
   		 "BillingAddressCountry": body1.BillingAddressCountry,			   		
   		 "BillingContactPhone": phone									
		};	 
	return ret;
}

// convert result using master table and ExtSysRef table
var jsonDoubleP = (body1,body2) => {
 	var ret = {		 
   		 "MasterCustomerID": body1.MasterCustomerID,				
   		 "Email": body1.Email,				
   	     "FirstName": body1.FirstName,				
   		 "LastName": body1.LastName,			
		 // body1.Status		
   		 "Status": body1.Status,	
   		 "BillingAddress1": body2.BillingAddress1,				
   		 "BillingAddress2": body2.BillingAddress2,					
   		 "BillingAddress3": body2.BillingAddress3,						
   		 "BillingAddressCountry": body2.BillingAddressCountry,						
   		 "BillingContactPhone": body2.BillingContactPhone							
		};
	 return ret;
}
var _notNull = function(obj){
	return obj != null 
			&& typeof obj !== 'undefined';
}

var _extractPersonalAccountMaster = function(personalAccount){
	return {
		"Email": personalAccount.Email,
		"FirstName": personalAccount.FirstName,
		"LastName": personalAccount.LastName,
		// error-> call CRM Service error using the blow column
		"Status": personalAccount.Status,
		// set false according to WS_001' Mandatory column
		"WK_eNews": false,
		"MPlus_eNews": false
		// ,
		// "BillingAddress1": personalAccount.BillingAddress1, 
		// "BillingAddress2": personalAccount.BillingAddress2, 
		// "BillingAddress3": personalAccount.BillingAddress3, 
		// "BillingAddressCountry": personalAccount.BillingAddressCountry 
	};
}

var _extractPersonalAccountExtSysRef = function(personalAccount){
	var extSysRef = {};
	// if(personalAccount["MasterCustomerID"]) extSysRef["MasterCustomerID"] = personalAccount["MasterCustomerID"];
	if(_notNull(personalAccount["SystemSourceKey"]))
		 extSysRef["SystemSourceKey"] = personalAccount["SystemSourceKey"];
	if(_notNull(personalAccount["BillingAddress1"])) 
		extSysRef["BillingAddress1"] = personalAccount["BillingAddress1"];
	if(_notNull(personalAccount["BillingAddress2"])) 
		extSysRef["BillingAddress2"] = personalAccount["BillingAddress2"];
	if(_notNull(personalAccount["BillingAddress3"])) 
		extSysRef["BillingAddress3"] = personalAccount["BillingAddress3"];
	if(_notNull(personalAccount["BillingAddressCountry"])) 
		extSysRef["BillingAddressCountry"] = personalAccount["BillingAddressCountry"];
	if(_notNull(personalAccount["BillingContactPhone"])) 
		extSysRef["BillingContactPhone"] = personalAccount["BillingContactPhone"];
	return extSysRef;
}

var _transformPersonalAccount = function(personalAcct, context){
	const commonSrv = new commonService(context);
	const deferred = Q.defer();
	// var fSystemSourceKey = personalAcct.SystemSourceKey;
	// if(fSystemSourceKey && fSystemSourceKey!=='VEM'){
	// 	deferred.resolve(personalAcct);
	// 	return deferred.promise;
	// }
	var fBillingAddressCountry = personalAcct.BillingAddressCountry;
	if (fBillingAddressCountry && fBillingAddressCountry.toString().length > 0) {
		commonSrv.convertCountryCodeToName([fBillingAddressCountry])
			.then(function (countryNames) {
				if (countryNames[fBillingAddressCountry]) {
					personalAcct.BillingAddressCountry = countryNames[fBillingAddressCountry];
					deferred.resolve(personalAcct)
				} else {
					const failureRes = {
						errorMessage: "Fail to update personal account record",
						developerErrorMessage: "No country name mapping found for BillingAddressCountry '" + fBillingAddressCountry + "'"
					};
					deferred.reject(failureRes);
				}
			})
	} else {
		deferred.resolve(personalAcct)
	}
	return deferred.promise;
};

var _createPersonalAccount = function(personalAccount,context){
	const deferred = Q.defer();
	// accService
	const accService = new accountService(context);
	// Internal Retrieve Personal A/C (Release 1)
	var reqBody4Email = personalAccount.Email;

	// Internal Create Personal A/C (Release 1)
	var reqBody4AccMaster = _extractPersonalAccountMaster(personalAccount);
		// {
		// 	"Email": personalAccount.Email,
		// 	"FirstName": personalAccount.FirstName,
		// 	"LastName": personalAccount.LastName,
		// 	// error-> call CRM Service error using the blow column
		// 	"Status": personalAccount.Status,
		// 	// set false according to WS_001' Mandatory column
		// 	"WK_eNews": false,
		// 	"MPlus_eNews": false
		// 	// ,
		// 	// "BillingAddress1": personalAccount.BillingAddress1, 
		// 	// "BillingAddress2": personalAccount.BillingAddress2, 
		// 	// "BillingAddress3": personalAccount.BillingAddress3, 
		// 	// "BillingAddressCountry": personalAccount.BillingAddressCountry 
		// }

	// Upsert CRM Personal Account External System Reference
	var reqBody4AcctExtSysRef = _extractPersonalAccountExtSysRef(personalAccount);
	//{};
	// // if(personalAccount["MasterCustomerID"]) reqBody4AcctExtSysRef["MasterCustomerID"] = personalAccount["MasterCustomerID"];
	// if(_notNull(personalAccount["SystemSourceKey"]))
	// 	 reqBody4AcctExtSysRef["SystemSourceKey"] = personalAccount["SystemSourceKey"];
	// if(_notNull(personalAccount["BillingAddress1"])) 
	// 	reqBody4AcctExtSysRef["BillingAddress1"] = personalAccount["BillingAddress1"];
	// if(_notNull(personalAccount["BillingAddress2"])) 
	// 	reqBody4AcctExtSysRef["BillingAddress2"] = personalAccount["BillingAddress2"];
	// if(_notNull(personalAccount["BillingAddress3"])) 
	// 	reqBody4AcctExtSysRef["BillingAddress3"] = personalAccount["BillingAddress3"];
	// if(_notNull(personalAccount["BillingAddressCountry"])) 
	// 	reqBody4AcctExtSysRef["BillingAddressCountry"] = personalAccount["BillingAddressCountry"];
	// if(_notNull(personalAccount["BillingContactPhone"])) 
	// 	reqBody4AcctExtSysRef["BillingContactPhone"] = personalAccount["BillingContactPhone"];
	
	// call retrievePersonalAccountMaster
	accService
		.retrievePersonalAccountMaster("", reqBody4Email)
		.then((response) => {
			if (response.Success) {
				// set acctExtSysRef
				var acctExtSysRef = {};
				acctExtSysRef.reqBody4AcctExtSysRef = reqBody4AcctExtSysRef;
				acctExtSysRef.path4MasterCustomerID = response.customer.MasterCustomerID;
				return accService.upsertPersonalAccountExtSysRef(acctExtSysRef);
			}
		}).then((response) => {
			// response 200
			// res.status(200).send(response.Body);
			deferred.resolve(response.Body);
		}).fail((error) => {
			if (error.developerErrorMessage.indexOf("customer does not exist.") > -1) {
				accService.createPersonalAccountMaster(reqBody4AccMaster)
					.then((response) => {
						// set acctExtSysRef
						var acctExtSysRef = {};
						acctExtSysRef.reqBody4AcctExtSysRef = reqBody4AcctExtSysRef;
						acctExtSysRef.path4MasterCustomerID = response.MasterCustomerID;
						return accService.upsertPersonalAccountExtSysRef(acctExtSysRef);
					}).then((response) => {
						// response 200
						// res.status(200).send(response.Body);
						deferred.resolve(response.Body);
					}).fail((error1) => {
						// response 400
						// res.status(400).send(error1);
						deferred.reject(error1);
					});
			} else {
				// response 400
				// res.status(400).send(error);
				deferred.reject(error);
			}

		});
	return deferred.promise;
}

module.exports = {
	/* Aman-20170408 */
	updatePersonalAccount : (req, res) => {
		const context = { req, res };
		const masterCustomerId = req.params.MasterCustomerID;
		const acctSrv = new accountService(context);
		_transformPersonalAccount(req.body, context)
			.then(function (personalAccount) {
				var personalAcctExtSysRef = _extractPersonalAccountExtSysRef(personalAccount)
				var acctExtSysRef = {};
				acctExtSysRef.reqBody4AcctExtSysRef = personalAcctExtSysRef;
				acctExtSysRef.path4MasterCustomerID = masterCustomerId;
				return acctSrv.upsertPersonalAccountExtSysRef(acctExtSysRef)
			})
			.then(function (response) {
				res.status(200).send(response.Body);
			})
			.fail(function (error) {
				res.status(400).send(error);
			})
	},
	// API-S 2017/3/23
	// Aman-20170408- change from "createPersonalAccountMaster" to "createPersonalAccount""
	createPersonalAccount : (req, res) => {
		const context = { req, res };
		const personalAcct = req.body;
		_transformPersonalAccount(personalAcct,context)
		.then(function(tPersonalAcct){
			return _createPersonalAccount(tPersonalAcct,context);
		})
		.then(function(result){
			res.status(200).send(result);
		})
		.fail(function(error){
			res.status(400).send(error);
		})
	},
	// Aman-20170408- change from "retrievePersonalAccountMaster" to "retrievePersonalAccount"
	retrievePersonalAccount: (req, res) => {
		const context = { req, res };

		// get params from request path
		const resPath = req.path;
		const masterCustomerId = resPath.replace("/accounts/individuals/", "");		
		const SystemSourceKey = req.query.SystemSourceKey;
		var CountryCodes = req.query.CountryCodes;
		const accService = new accountService(context);
		const commonSrv = new commonService(context);


		CountryCodes = (CountryCodes == null || CountryCodes == "" || typeof CountryCodes === 'undefined')?2:CountryCodes;
		if(CountryCodes.toString()!=='2' && CountryCodes.toString()!=='3'){
			res.status(400).send({
				errorMessage: "Fail to retrieve personal account record",
				developerErrorMessage: "Invalid parameter 'CountryCodes'"
			});
			return;
		}
		CountryCodes=parseInt(CountryCodes);

	  	// personalAccount Master table info
		var ret ={};
		// sskFlag exist flg
		var sskFlag = true;
		// return result
		var result = {};

		accService
			.retrievePersonalAccountMaster(masterCustomerId,"")
            .then((response) => {
				if (response.Success) {
					// personalAccount Master table info
					ret = response.customer;
					// systemSourceKey is not empty
					if (typeof SystemSourceKey !== 'undefined' && SystemSourceKey!= "" && SystemSourceKey != null) {
						// retrievePersonalAccountExtSysRef
						// =>/internal/crm/accounts/individuals/{mid}/external-system-refs/{SystemSourceKey}
						return accService.retrievePersonalAccountExtSysRef(masterCustomerId,SystemSourceKey);
					} else {						
						// sskFlag exist flg
						sskFlag = false;

						// return promise
						const deferred = Q.defer();
						 // personalAccount Master table info
						deferred.resolve(ret)
						return deferred.promise;
					} 											
				} 
			}).then((response) => {
				var personalAcct = null;
				// systemSourceKey exist 
				if(sskFlag){
					// CorporateAccountExtSysRef table info
        			var ret2 = response.Body;
					// convert result using master table and ExtSysRef table
					// result=jsonDoubleP(ret,ret2);
					personalAcct=jsonDoubleP(ret,ret2);
				} else {
					// convert result using master table
					personalAcct=jsonSingleP(response);
				}
				const deferred = Q.defer();
				deferred.resolve(personalAcct);
				return deferred.promise;
			}).then((personalAcct)=>{
				if (personalAcct.BillingAddressCountry != null
					&& personalAcct.BillingAddressCountry != ""
					&& typeof personalAcct.BillingAddressCountry !== 'undefined') {
					commonSrv.convertCountryNameToCode([personalAcct.BillingAddressCountry], CountryCodes)
					.then(function (countryCodes) {
						if (countryCodes[personalAcct.BillingAddressCountry]) {
							personalAcct.BillingAddressCountry = countryCodes[personalAcct.BillingAddressCountry];
							res.status(200).send(personalAcct);
						} else {
							const failureRes = {
								errorMessage: "Fail to retrieve personal account record",
								developerErrorMessage: "No country code mapping found for BillingAddressCountry '" + result.BillingAddressCountry + "'"
							};
							res.status(400).send(failureRes);
						}
					}).fail((error) => {
						console.log(error);
						// response 400
						res.status(400).send(error);
					});
				} else {
					res.status(200).send(personalAcct);
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
