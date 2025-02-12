'use strict';
const apigwConfig = rootRequire('config/apigw');
var request = require('request');
var Q = require("q");
const fs  = require('fs');
// const ca = fs.readFileSync(apigwConfig.ca[0]);

// Not to use original cert, by Fung 20231016
// const ca = apigwConfig.ca.map(function(elem, ind){
//     return fs.readFileSync(elem);
// })

// const ca1 = fs.readFileSync(__dirname+"/../"+apigwConfig.ca1);
// const ca2 = fs.readFileSync(__dirname+"/../"+apigwConfig.ca2);

const logger = rootRequire('utility/logger');

var _headers = (customHeaders) => {
    var headers = customHeaders?customHeaders:{};
    for(var authType in apigwConfig.auth){
        switch(authType){
            case "basic":
            var username = apigwConfig.auth[authType].username;
            var password = apigwConfig.auth[authType].password;
            var str = username +":"+ password;
            headers["Authorization"] = "Basic "+Buffer.from(str).toString('base64')
            break;
            case "apikey":
            headers["apikey"] = apigwConfig.auth[authType];
            break;
            case "oauth":
            break;
        }
    }
    return headers;
}

// var _request = (endpoint, qs, method, customHeaders, jsonData, context)=>{
var _request = (param)=>{
    var deferred = Q.defer();

    var endpoint = param.endpoint
        , qs = param.qs
        , method = param.method
        , customHeaders = param.customHeaders
        , jsonData = param.jsonData
        , context = param.context;

    var url = apigwConfig.host+endpoint;
    var headers = _headers(customHeaders);
    var options = {
        url: url,
        qs: qs?qs:{},
        method: method, 
        headers: headers,
        json : (jsonData)?jsonData:{},
        // ca
        // timeout:5000
    };
    
    /* Outbound Request Logging */
    var request_uuid = (new Date()).getTime();
    var trx_uuid = (context && context.req)?context.req.trx_uuid:null;
    logger.info("#[" + trx_uuid + "][" + request_uuid + "][OUT-REQ] " + method + " " + url + " ");
    logger.debug("#[" + trx_uuid + "][" + request_uuid + "][OUT-REQ] Headers: " + JSON.stringify(headers));
    logger.debug("#[" + trx_uuid + "][" + request_uuid + "][OUT-REQ] Body: " + JSON.stringify(jsonData));
    /* End of Outbound Request Logging */

    request(options, function(error, response, body){
        if(error) {
            logger.info("#["+trx_uuid+"]["+request_uuid+"][OUT-REQ] Error: "+JSON.stringify(error));
            deferred.reject(error.code);
        } else { 
            logger.info("#["+trx_uuid+"]["+request_uuid+"][OUT-RES] "+method+" "+url +" Respond Status "+response.statusCode+"("+response.statusMessage+")");
            if(response.statusCode>=400){
                logger.info("#["+trx_uuid+"]["+request_uuid+"][OUT-RES] Body: "+JSON.stringify(body));
            }
            logger.debug("#["+trx_uuid+"]["+request_uuid+"][OUT-RES] Headers: "+JSON.stringify(response.headers));
            logger.debug("#["+trx_uuid+"]["+request_uuid+"][OUT-RES] Body: "+JSON.stringify(body));
            deferred.resolve({
                statusCode : response.statusCode,
                body : body
            })
        }
    });
    return deferred.promise;
}

var _HTTP_METHOD = {GET:"GET",POST:"POST",PUT:"PUT",PATCH:"PATCH"}

module.exports = {
    // get : (endpoint,qs,customHeaders, context) => {
    get : (param) => {
        var _param = {
            endpoint : param.endpoint, 
            qs : param.qs, 
            method : _HTTP_METHOD.GET, 
            customHeaders : param.customHeaders, 
            jsonData : param.jsonData, 
            context : param.context
        }
        return _request(_param);
        // return _request(endpoint,qs,_HTTP_METHOD.GET,customHeaders, context);
    },
    // post :  (endpoint,qs,customHeaders,jsonData, context) => {
    post :  (param) => {
        var _param = {
            endpoint : param.endpoint, 
            qs : param.qs, 
            method : _HTTP_METHOD.POST, 
            customHeaders : param.customHeaders, 
            jsonData : param.jsonData, 
            context : param.context
        }
        return _request(_param);
        // return _request(endpoint,qs,_HTTP_METHOD.POST,customHeaders,jsonData, context);
    },
    // put :  (endpoint,qs,customHeaders,jsonData, context) => {
    put :  (param) => {
        var _param = {
            endpoint : param.endpoint, 
            qs : param.qs, 
            method : _HTTP_METHOD.PUT, 
            customHeaders : param.customHeaders, 
            jsonData : param.jsonData, 
            context : param.context
        }
        return _request(_param);
        // return _request(endpoint,qs,_HTTP_METHOD.PUT,customHeaders,jsonData, context);
    },
    // patch :  (endpoint,qs,customHeaders,jsonData, context) => {
    patch :  (param) => {
        var _param = {
            endpoint : param.endpoint, 
            qs : param.qs, 
            method : _HTTP_METHOD.PATCH, 
            customHeaders : param.customHeaders, 
            jsonData : param.jsonData, 
            context : param.context
        }
        return _request(_param);
        // return _request(endpoint,qs,_HTTP_METHOD.PATCH,customHeaders,jsonData, context);
    }
}