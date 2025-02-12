'use strict';
const logger = rootRequire('utility/logger');
const eventService = rootRequire('service/event-service.js');
const commonService = rootRequire('service/common-service.js');
const Q = require("q");

module.exports = {
	post: function(req, res) {
		const eventId = req.params.eventId;
		
		let personalAccount = {
			Email: req.body.Email,
			MasterCustomerID: req.body.CustomerID,
			LastName: req.body.LastName,
			WK_eNews: req.body.WK_eNews,
			MPlus_eNews: req.body.MPlus_eNews,
			
			// By Anthony 20190920
			CustomerSource: req.body.CustomerSource,
			EmailOptinDate1: req.body.EmailOptinDate1,
			EmailOptinDate2: req.body.EmailOptinDate2,
			OptInChannel1: req.body.OptInChannel1,
			OptInChannel2: req.body.OptInChannel2,
			//
			// Polo 20190924
			Salutation: req.body.EventTransaction.Salutation,
			FirstName: req.body.EventTransaction.RegistrantFirstName
			// End Polo


		};

		// MasterCustomerID has higher priority in "personalAccountAssurance"
		// in "eventReg", Email/MID is either 1
		// but in "personalAccountAssurance", Email is mandatory
		if (personalAccount.MasterCustomerID) {
			personalAccount.Email = "_dummy"
		}

		let eventRegistration = req.body;

		delete eventRegistration.LastName; 
		delete eventRegistration.WK_eNews; 
		delete eventRegistration.MPlus_eNews;
		delete eventRegistration.Email;

                    // By Anthony 20190920
                    delete eventRegistration.CustomerSource;
                    delete eventRegistration.EmailOptinDate1;
                    delete eventRegistration.EmailOptinDate2;
                    delete eventRegistration.OptInChannel1;
                    delete eventRegistration.OptInChannel2;                    
                    //

		const context = { req, res };
		
		const comService = new commonService(context);
		const eveService = new eventService(context);

		comService.personalAccountAssurance(personalAccount)
			.then((response) => {
				eventRegistration.CustomerID = response.MasterCustomerID;
				return eveService.createOnlineEventRegistration(eventId, eventRegistration)
			})
			.then((response) => {
				res.status(200).send(response);
			})
			.fail((error) => {
				res.status(400).send(error);
			});
	}
}
