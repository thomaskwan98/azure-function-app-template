'use strict';
const logger = rootRequire('utility/logger');

module.exports = (req, res, next) => {
	var d = new Date();
	var trx_uuid = d.getTime();
	req.trx_uuid = trx_uuid;
	logger.info("#Start Transaction : [" + trx_uuid + "]")
	logger.info("#[" + trx_uuid + "][" + trx_uuid + "][IN-REQ] " + req.method + " " + req.originalUrl + " ");
	logger.debug("#[" + trx_uuid + "][" + trx_uuid + "][IN-REQ] Headers: " + JSON.stringify(req.headers) + "] ");
	logger.debug("#[" + trx_uuid + "][" + trx_uuid + "][IN-REQ] Body: " + JSON.stringify(req.body) + "] ");
	next()
}