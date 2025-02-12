'use strict';
const tsFormat = () => {
	const dateOfNow = new Date();
	return dateOfNow.toLocaleDateString() + " " + dateOfNow.toLocaleTimeString();
}

// Use Azure's logging, by Fung 20231016
// const logDir = '/opt/APIBE/log/crm-customized-api';

module.exports = {
	// logDir,
	requireConsole:true,
	console: {
		timestamp: tsFormat,
		colorize: true,
		level: process.env.LOGGER_LOG_LEVEL
		// level: 'info'
	},
	// file: {
	// 	filename: logDir+'/.logs',
	// 	timestamp: tsFormat,
	// 	datePattern: 'yyyy-MM-dd',
	// 	prepend: true,
	// 	level: 'debug',
	// 	json: false
	// }
};
