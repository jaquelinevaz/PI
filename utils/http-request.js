/**
 * Created by Jaqueline on 02/09/2016.
 */
//'use strict'

var http = require('http');

module.exports = function (options, cb) {


    var req = http.request(options, processResponse);

    req.end();

    function processResponse(res) {
        var response = "";
        res.on('data', function(data){ response += data});
        res.on('end', function(){cb(null,JSON.parse(response))});
        res.on('error', function(e){cb(e)});

        //console.log(response);
    }

}