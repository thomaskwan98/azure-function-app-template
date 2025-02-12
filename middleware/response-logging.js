'use strict';
const logger = rootRequire('utility/logger');

module.exports = (req, res, next) => {
    var _send = res.send;
    res.send = function(body){
        logger.info("#["+req.trx_uuid+"]["+req.trx_uuid+"][IN-RES] "+req.method+" "+req.originalUrl+" Respond Status "+this.statusCode);
        logger.debug("#["+req.trx_uuid+"]["+req.trx_uuid+"][IN-RES] Headers: "+JSON.stringify(this.header()._headers)+"] ");
        logger.debug("#["+req.trx_uuid+"]["+req.trx_uuid+"][IN-RES] Body: "+JSON.stringify(body)+"] ");
        _send.apply(this,arguments);
    };
    res.on('finish',function(){
        logger.info("#End Transaction : ["+req.trx_uuid+"]");
    })
    next();
}