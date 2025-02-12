'use strict';
const logger = rootRequire('utility/logger');
const accountService = rootRequire('service/account-service.js');
const Q = require("q");

module.exports = {
	personalAccountAssurance: function(req, res) {
		const context = { req, res };

		const personalAccount = req.body;
		let MasterCustomerID = personalAccount.MasterCustomerID;
		let email = personalAccount.Email;
		let emailToRetrieve = personalAccount.Email;
		let isUsingMID;
		if (MasterCustomerID){ 
			emailToRetrieve = "";
			isUsingMID = true
		}

		if (
			( !personalAccount.WK_eNews && personalAccount.WK_eNews !== false) || 
			( !personalAccount.MPlus_eNews && personalAccount.MPlus_eNews !== false) || 
			!personalAccount.Email || 
			!personalAccount.LastName ) {
			logger.debug("[APIGW-ERROR] [" + context.req.trx_uuid + "] Request has missing or invalid parameters: null/missing")
			res.status(400).send({
				errorMessage : "Fail to create account",
				developerErrorMessage : "[APIGW-ERROR] Request has missing or invalid parameters"
			});
			return;
		}

		if (personalAccount.WK_eNews && !personalAccount.EmailOptinDate1) {
			logger.debug("[APIGW-ERROR] [" + context.req.trx_uuid + "] Request has missing or invalid parameters: EmailOptinDate1")
			res.status(400).send({
				errorMessage : "Fail to create account",
				developerErrorMessage : "[APIGW-ERROR] Request has missing or invalid parameters"
			});
			return;
		}

		if (personalAccount.MPlus_eNews && !personalAccount.EmailOptinDate2) {
			logger.debug("[APIGW-ERROR] [" + context.req.trx_uuid + "] Request has missing or invalid parameters: EmailOptinDate2")
			res.status(400).send({
				errorMessage : "Fail to create account",
				developerErrorMessage : "[APIGW-ERROR] Request has missing or invalid parameters"
			});
			return;
		}

		const accService = new accountService(context);

		accService
			.retrievePersonalAccountMaster(MasterCustomerID, emailToRetrieve)
			.then((response) => {
				if (!response.Success) {
					// if not exist, create a new Personal Account
					return accService.createPersonalAccountMaster(personalAccount);
				} else {
					// else response to consumer
					response.MasterCustomerID = response.customer.MasterCustomerID;
					delete response.customer;
					res.status(200).send(response);
				}
			})
			.then((response) => {
				if (response){
					res.status(200).send(response);
				}
			})
			.fail((error) => {
				if (isUsingMID) {
					res.status(400).send(error);
				} else
				if ( error.developerErrorMessage.indexOf("customer does not exist.") > -1 ) {
					accService
						.createPersonalAccountMaster(personalAccount)
						.then((response) => {
							res.status(200).send(response);
						})
						.fail((error) => {
							res.status(400).send(error);
						})
				} else {
					res.status(400).send(error);
				}
			});
	},

	// API-S 2017/9/18
	checkCustomerExistenceAndSubscription: function(req, res) {
		logger.info("Check Customer Existence and Newsletter Subscription: " + req.body.Email);
		const context = { req, res };

		const accService = new accountService(context);
		accService
		.retrievePersonalAccountMaster("",req.body.Email)
			.then((response) => {
				var payload = {};
				if (response.Success) {
					// if exist
					payload.MasterCustomerID = response.customer.MasterCustomerID;
					if(req.body.ENewsInstance && response.customer[req.body.ENewsInstance] != undefined){
						payload.SubscriptionStatus = response.customer[req.body.ENewsInstance];
						payload.CustomerExist = response.Success;
						payload.Remarks = response.Remarks ? response.Remarks:"";
						payload.Email = req.body.Email ? req.body.Email:"";
						payload.ENewsInstance = req.body.ENewsInstance ? req.body.ENewsInstance:"";
						res.status(200).send(payload);
					}else{
						res.status(400).send({
							errorMessage : "Fail to Check Customer Existence and Subscription",
							developerErrorMessage : "Customer exists but eNews '" + (req.body.ENewsInstance?req.body.ENewsInstance:"") + "' not found"
						});
					}
				}
			})
			.fail((error) => {
				if (error.developerErrorMessage.indexOf("customer does not exist") > -1 ) {
					var payload = {};
					// if not exist
					payload.MasterCustomerID = "";
					payload.SubscriptionStatus = false;

					payload.CustomerExist = false;
					payload.Remarks = error.developerErrorMessage.replace("[APIGW-ERROR] ","");
					payload.Email = req.body.Email ? req.body.Email:"";
					payload.ENewsInstance = req.body.ENewsInstance ? req.body.ENewsInstance:"";
					res.status(200).send(payload);
				} else {
					res.status(400).send(error);
				}
			});
	}
	// API-E 2017/9/18
}
