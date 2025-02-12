'use strict';
const logger = rootRequire('utility/logger');
const crmTicketService = rootRequire('service/crm-tickettransaction-service');
const commonService = rootRequire('service/common-service');
const Q = require("q");

var notNull = function(obj){
			return obj != null 
			&& obj != "" 
			&& typeof obj !== 'undefined';
			}

module.exports = {
    // createTicketingTransaction 
    createTicketingTransaction   : (req, res) => {
        const context = { req, res };
        // requst Body
        const requestBody = req.body;

	console.log("--[debug] requestBody", requestBody) // Kelvin 2022-01-18

        // TicketingTxnHeader
        var TicketingTxnHeader = {
            "TransactionID": requestBody.transactionID,
            "TransactionDateTime": requestBody.transactionDateTime,
            "MasterCustomerID": requestBody.masterCustomerID,
            "CustomerEmail": requestBody.customerEmail,
            "TransactionType": requestBody.transactionType,
            "NoOfTicketsPurchased": requestBody.noOfTicketsPurchased,
            "TotalAmount": requestBody.totalAmount,
            "POSTerminalSeller": requestBody.posTerminalSeller,
            "ReturnReason": requestBody.returnReason,
            "ReprintReason": requestBody.reprintReason,
            "SalesChannel": requestBody.salesChannel,
            "GuestPurchase": requestBody.guestPurchase,
            "CustomerLastName": requestBody.customerLastName,
            "SISTICPatronID": requestBody.sisticPatronAccountNo
        };

        // TicketingTransactions
        let TicketingTransactions = [];
        let TicketingTransactionsCountryCodes = [];
        // TicketingTicLvFees
        let TicketingTicLvFees =[];
        // from tickets
        let Tickets = requestBody.tickets;
        for(var index =0; index < Tickets.length; index++){
            let ticket = Tickets[index];
            // ticketingTransaction
            let ticketingTransaction = {
                "BasePriceGrossUnitPrice": ticket.basePriceGrossUnitPrice, 
                "DeliveryMethod": ticket.deliveryMethod, 
                "EventCode": ticket.productCode, 
                "IsFromWSCreate": true,
                "Level": ticket.seat.level, 
                "DeliveryAddress1": ticket.mailingAddress.address1, 
                "DeliveryAddress2": ticket.mailingAddress.address2, 
                "DeliveryAddress3": ticket.mailingAddress.address3, 
                "DeliveryAddressCountry": ticket.mailingAddress.countryCode, 
                "MasterCustomerID": requestBody.masterCustomerID, 
                "PayTicketAmount": ticket.payTicketAmount, 
                "PriceCategoryName": ticket.priceCategoryName, 
                "PriceClassName": ticket.priceClassName, 
                "PriceClassCode": ticket.priceClassCode, 
                "SeatAttribute": ticket.seat.attribute, 
                "SeatNoRow": ticket.seat.rowNo, 
                "SeatNoSeat": ticket.seat.seatNo, 
                "SeatNoSection": ticket.seat.sectionNo, 
                "SeatType": ticket.seat.seatType, 
                "TicketingEventID": ticket.productID, 
                "TicketingTicketID": ticket.ticketID, 
                "TicketType": ticket.ticketType, 
                "TransactionID": requestBody.transactionID 
            };
            // TicketingTransactionsCountryCodes
            TicketingTransactionsCountryCodes[TicketingTransactionsCountryCodes.length] = ticket.mailingAddress.countryCode;
            // push
            TicketingTransactions.push(ticketingTransaction);

            // from ticket's ticketFees
            let TicketFees = ticket.ticketFees;
            for(var j =0; j < TicketFees.length; j++){
                let ticketFee = TicketFees[j];
                // ticketingTicLvFee
                let ticketingTicLvFee = {
                    "TransactionID": requestBody.transactionID, 
                    "TicketingTicketID": ticket.ticketID,
                    "TicketOutsideChargeFeeName": ticketFee.feeName,
                    "TicketOutsideChargeFeeAmount": ticketFee.chargeAmount
                }
                // push
                TicketingTicLvFees.push(ticketingTicLvFee);
            }
        }

    // TicketingTxnHeaderLvFees
    let TicketingTxnHeaderLvFees = [];
    // from transactionfees
    let Transactionfees = requestBody.transactionfees;
    for(var index =0; index < Transactionfees.length; index++){
            let transactionfee = Transactionfees[index]
            let ticketingTxnHeaderLvFee = {
                "TransactionID": requestBody.transactionID,
                "TransactionOutsideChargeFeeName": transactionfee.feeName,
                "TransactionOutsideChargeFeeAmount": transactionfee.chargeAmount
            }
            // push
            TicketingTxnHeaderLvFees.push(ticketingTxnHeaderLvFee);
    }

        // TicketingPayments
    let TicketingPayments = [];
    // from payments
    let Payments = requestBody.payments;
    for(var index =0; index < Payments.length; index++){
            let payment = Payments[index]
            let ticketingPayment = {
                "TransactionID": requestBody.transactionID,
                "PaymentMethod": payment.paymentMethod, 
                "PaymentAmount": payment.paymentAmount
            }
            // push
            TicketingPayments.push(ticketingPayment);
    }

    const comService = new commonService(context);
    const ticketService = new crmTicketService(context);

    comService.convertCountryCodeToName(TicketingTransactionsCountryCodes, 2)
            .then((countryNames) => {
		console.log("--[debug] countryNames", countryNames) // Kelvin 2022-01-18
                const failureRes = {
                    errorMessage : "Fail to retrieve CountryName",
                    developerErrorMessage : "Fail to retrieve CountryName"
                };

                // retrieveFlag
                var retrieveFlag = true;
                var retrieveError = "";
                for(var index =0;index < TicketingTransactionsCountryCodes.length;index++){
                    var countryCode = TicketingTransactionsCountryCodes[index];
                    var countryName = countryNames[countryCode];
                    // set countryName from countryCode
                    TicketingTransactions[index].DeliveryAddressCountry = countryName;
                    if((notNull(countryCode) && !notNull(countryName))){
                        retrieveFlag = false;
                        retrieveError = (retrieveError == "") ?countryCode:(retrieveError + "," +countryCode);
                    }
                }

                if(retrieveFlag){
                    // set reqBody
                    var reqBody = {};
                    var ticketingRecons = [];
                    // set ticketingRecon
                    let ticketingRecon ={};
                    ticketingRecon.TicketingTxnHeader = TicketingTxnHeader;
                    ticketingRecon.TicketingTransactions = TicketingTransactions;
                    ticketingRecon.TicketingTicLvFees = TicketingTicLvFees;
                    ticketingRecon.TicketingTxnHeaderLvFees = TicketingTxnHeaderLvFees;
                    ticketingRecon.TicketingPayments = TicketingPayments;
                    // push
                    ticketingRecons.push(ticketingRecon);
                    reqBody.ticketingRecons = ticketingRecons;
                                   
                    return ticketService.createTicketingTransaction(reqBody);
                } else {
                    const deferred = Q.defer();
                    // set retrieveError
                    failureRes.developerErrorMessage = "No country name mapping found for ticket.mailingAddress.countryCode '" + retrieveError + "'";
                    deferred.reject(failureRes);
                    return deferred.promise;	
                }
            })
            .then((result) => {
		    console.log("--[debug] 200 result returned", result) //Kelvin 2022-01-18
                    // response 200
                    res.status(200).send(result.Body);
                })	
            .fail((error) => {
		console.log("--[debug] 400 error  returned", error) // Kelvin 2022-01-18
                console.log(error);
                // response 400
                res.status(400).send(error);
            });
    }

}
