'use strict';
const loggerConfig = rootRequire('config/logger');
const winston = require('winston');

// Use Azure's logging, by Fung 20231016
// const fs = require('fs');
// require('winston-daily-rotate-file');

// // Create the log directory if it does not exist
// if (!fs.existsSync(loggerConfig.logDir)) { fs.mkdirSync(loggerConfig.logDir); }

// const transports = [new (winston.transports.DailyRotateFile)(loggerConfig.file)];
const transports = [];
if(loggerConfig.requireConsole && loggerConfig.console){
	transports.push(new (winston.transports.Console)(loggerConfig.console))
}

const logger = new (winston.Logger)({
	transports: transports
});

module.exports = logger;
