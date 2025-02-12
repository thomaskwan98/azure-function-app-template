'use strict';
const logger = rootRequire('utility/logger');
const donationService = rootRequire('service/donation-service.js');
const commonService = rootRequire('service/common-service.js');
const Q = require("q");

module.exports = {
	post: function(req, res) {
		const eventId = req.params.eventId;
		
		let personalAccount = {
			Email: req.body.PrimaryContactEmail,
			MasterCustomerID: req.body.CustomerId,
			LastName: req.body.LastName,
			WK_eNews: req.body.WK_eNews,
			MPlus_eNews: req.body.MPlus_eNews
		};
		logger.debug(personalAccount);

		// MasterCustomerID has higher priority in "personalAccountAssurance"
		// in "onlinedonation", Email/MID is either 1
		// but in "personalAccountAssurance", Email is mandatory
		if (personalAccount.MasterCustomerID) {
			personalAccount.Email = "_dummy"
		}

		let onlineDonationTranscaction = req.body;

		delete onlineDonationTranscaction.LastName; 
		delete onlineDonationTranscaction.WK_eNews; 
		delete onlineDonationTranscaction.MPlus_eNews;
		delete onlineDonationTranscaction.Email;

		const context = { req, res };
		
		const comService = new commonService(context);
		const donService = new donationService(context);

		comService.personalAccountAssurance(personalAccount)
			.then((response) => {
				logger.debug(">>> odooc .then((response) => {");
				logger.debug(response);
				onlineDonationTranscaction.CustomerId = response.MasterCustomerID;
				return donService.createDonationTransaction(onlineDonationTranscaction)
			})
			.then((response) => {
				logger.debug(">>> odooc .then((response) => {");
				logger.debug(response);
				res.status(200).send(response);
			})
			.fail((error) => {
				logger.debug(">>> odooc .fail((error) => {");
				logger.debug(error);
				res.status(400).send(error);
			});
	}
}
