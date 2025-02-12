'use strict';
/* rootRequire method is useful when the folder structure is complex */
global.rootRequire = function(name) {
	return require(__dirname + '/' + name);
}
global.rootPath = __dirname;

global.cache = {

	countryList: {
		content: "",
		lastUpdate: 0
	}

};

// To use Azure App Service provided certs, by Fung 20231016
// const serverConfig = require('./config/server');
// To use Azure Application Insights, by Fung 20231016
require('./utility/app-insights'); 
const logger = require('./utility/logger');
// const sslCert = serverConfig.sslCert;
// const httpsPort = serverConfig.httpsPort;
const httpPort = process.env.PORT || 3000; 
const payloadSizeLimit = process.env.SIZE_LIMIT || '1000kb'; 
const fs = require('fs');
// const https = require('https');
const http = require('http');
const app = require('express')();
const bodyParser = require('body-parser');
const ipfilter = require('express-ipfilter').IpFilter;

const masterRoutes = require('./route'); // require('./route/index.js')

// app.use(ipfilter(ips, {mode: 'allow'})); // IP Whitelist
app.use("/crm/ticketsales", bodyParser.json({ limit: payloadSizeLimit, type: 'application/json' }));
app.use(bodyParser.json({ type: 'application/json' }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(require('./middleware/request-logging'));
app.use(require('./middleware/response-logging'));

app.use('/', masterRoutes);


// Change to HTTP and use Azure App Service provided certs, by Fung 20231016

// var privateKey  = fs.readFileSync(sslCert.key, 'utf8');
// var certificate = fs.readFileSync(sslCert.cert, 'utf8');

// var credentials = {
// 	key: privateKey, 
// 	cert: certificate
// };

// var httpsServer = https.createServer(credentials, app);
// httpsServer.listen(httpsPort, function () {
// 	logger.info("Start CRM Customized API listening on port "+httpsPort+" for HTTPS");
// 	console.log("CRM Customized API listening on port "+httpsPort+" for HTTPS");
// });

// process.on('SIGINT',() => {
// 	httpsServer.close();
// 	console.log("Stop CRM Customized API listening on port "+httpsPort+" for HTTPS");
// 	logger.info("Stop CRM Customized API listening on port "+httpsPort+" for HTTPS");
// 	process.exit();
// })

var httpServer = http.createServer(app); 
httpServer.listen(httpPort, function () {
	logger.info("Start CRM Customized API listening on port "+httpPort+" for HTTPS");
	console.log("CRM Customized API listening on port "+httpPort+" for HTTPS");
});

process.on('SIGINT',() => {
	httpServer.close();
	console.log("Stop CRM Customized API listening on port "+httpPort+" for HTTPS");
	logger.info("Stop CRM Customized API listening on port "+httpPort+" for HTTPS");
	process.exit();
})

// By Anthony 20190204 for SIP migration
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

/* debug */
/*
const http = require('http');


var httpServer = http.createServer(app);
httpServer.listen(3000, function () {
	logger.info("Start CRM Customized API listening on port "+3000+" for HTTP");
	console.log("CRM Customized API listening on port "+3000+" for HTTP");
});
*/
