'use strict';
const logger = rootRequire('config/logger');
const routes = require('express').Router();

const eventRegistrationViaWebsiteCtrl = rootRequire('controller/event/event-registration-via-website-ctrl');

routes.post('/:eventId/registrations/online', eventRegistrationViaWebsiteCtrl.post);

module.exports = routes;
