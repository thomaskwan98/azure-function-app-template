'use strict';

module.exports = {
	ip: '127.0.0.1',
    host: process.env.APIGW_HOST,
    ca: [
        rootPath + '/resource/ssl/apigw-ap-cert1.crt',
        rootPath + '/resource/ssl/apigw-ap-cert2.crt'
    ],
    // Masked auth before initial commit by Fung 20230919
    auth:{
        "basic" : {
            "username" : process.env.BASIC_AUTH_USERNAME,
            "password" : process.env.BASIC_AUTH_PASSWORD
        },
        "apikey" : process.env.API_KEY
    }
};
