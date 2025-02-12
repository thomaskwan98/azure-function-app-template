'use strict';

module.exports = {
    endPoint: {
        retrievePersonalAccountMaster : '/customers/details',
        createPersonalAccountMaster : '/customers',
        updatePersonalAccountMaster : '/customers',
        personalAccountAssurance : '/crm/services/accounts/individuals/assurance',
        createDonation : '/internal/payment/donations/transactions',
        onlineEventRegistration : '/internal/events/{eventID}/registrations/online',
        upsertPersonalAccountExtSysRef : '/internal/crm/accounts/individuals/{mid}/external-system-refs',
        retrievePersonalAccountExtSysRef : '/internal/crm/accounts/individuals/{mid}/external-system-refs/{SystemSourceKey}',
        createCorporateAccountMaster : '/internal/crm/accounts/corporates',
        updateCorporateAccountMaster : '/internal/crm/accounts/corporates/{mid}',
        retrieveCorporateAccountMaster : '/internal/crm/accounts/corporates/details',
        upsertCorporateAccountExtSysRef : '/internal/crm/accounts/corporates/{mid}/external-system-refs',
        retrieveCorporateAccountExtSysRef : '/internal/crm/accounts/corporates/{mid}/external-system-refs/{SystemSourceKey}',
        createVEMAccount: '/internal/vem/accounts',
        retrieveVEMAccount: '/internal/vem/accounts?mid={mid}',
        updateVEMAccount: '/internal/vem/accounts/{mid}',
        mapCountryCode: '/internal/services/countries?CountryName={CountryName}',
        createDonationTransaction: '/payment/donations/transactions',
        createOnlineEventRegistration: '/internal/events/{eventID}/registrations/online',
        checkPAExistanceAndNewsSubscription: '/crm/services/accounts/individuals/existence',
        createCRMTicketTransaction : '/internal/crm/ticketsales',
        // ca updateCorporateAccountMaster
        updateCorporateAccountMaster4Ca : '/crm/accounts/corporates/{mid}'
    }
};
