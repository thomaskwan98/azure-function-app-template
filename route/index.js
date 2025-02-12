'use strict';
const logger = rootRequire('config/logger');
const routes = require('express').Router();

routes.use('/crm/services', require('./common-services-route'));
routes.use('/crm/events', require('./events-route'));
routes.use('/crm', require('./accounts-route'));
routes.use('/payment/donations', require('./donations-route'));
routes.use('/crm/customers', require('./newsletters-subscription-route'));

routes.get('/health-check', (req, res) => {
	res.json({ 'status': 'Connection successful.' });
});



routes.use('*', function(req, res){
	res.status(404).json({ message: 'Resources not found. Invalid url.' });
});

module.exports = routes;
