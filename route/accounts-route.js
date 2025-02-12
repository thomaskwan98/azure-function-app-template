'use strict';
const logger = rootRequire('config/logger');
const routes = require('express').Router();

const commonServiceCtrl = rootRequire('controller/account/common-service-ctrl');
const corpAcctSyncCtrl = rootRequire('controller/account/corporate-account-sync-ctrl');
// ticketSalesCtrl
const ticketSalesCtrl = rootRequire('controller/ticketing/ticketsales-ctrl');
// "/crm/ticketsales"
routes.post('/ticketsales', ticketSalesCtrl.createTicketingTransaction);

routes.post('/accounts/individuals/assurance', commonServiceCtrl.personalAccountAssurance);

// API-S 2017/3/23
// corporateAccountCtrl
const corporateAccountCtrl = rootRequire('controller/account/corporate-account-ctrl');
// "/accounts/corporates"
routes.post('/accounts/corporates', corporateAccountCtrl.createCorporateAccountMaster);
// "/crm/accounts/corporates/{mid}"
routes.post('/accounts/corporates/*', corporateAccountCtrl.updateCorporateAccountMaster);
// "/crm/accounts/corporates/{mid}?SystemSourceKey={SystemSourceKey}"
routes.get('/accounts/corporates/*:SystemSourceKey:CountryCodes', corporateAccountCtrl.retrieveCorporateAccountMaster);

// personalAccountCtrl
const personalAccountCtrl = rootRequire('controller/account/personal-account-ctrl');
// "/crm/accounts/individuals"
routes.post('/accounts/individuals', personalAccountCtrl.createPersonalAccount);
// "/crm/accounts/individuals/{mid}?SourceSystemKey={SourceSystemKey} "
routes.get('/accounts/individuals/*:SystemSourceKey:CountryCodes', personalAccountCtrl.retrievePersonalAccount);
// API-S 2017/3/23
/* Aman-20170408 */
routes.put('/accounts/individuals/:MasterCustomerID', personalAccountCtrl.updatePersonalAccount);
/* End of Aman-20170408 */

// sync CRM to VEM
routes.post('/distributions/accounts/corporates', corpAcctSyncCtrl.syncAccounts);

module.exports = routes;
