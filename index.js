// JavaScript Document
        var config = require('./config.json');
        var host = config.host;
        var port = config.port;
var http = require('http'), fs = require('fs');
var server = http.createServer(function (request, response) {
	var url = request.url;
        //suddivisione url
        var urlArray = url.split('/');
        if (urlArray[(urlArray.length -1)] == '') {
            urlArray = urlArray.slice(1, -1);}
        else 
        urlArray = urlArray.slice(1);
        //var body = "";
        var not_found = true; //nel caso in cui la url richiesta non corrisponda a nulla
        var wxml = require ('./writeXml');
	if (url == "/") {
                response.setHeader("Content-Type", "text/xml");
                wxml.servizi(config, function (err, body){
                    if (err) not_found = true;
                    else {
                    not_found= false;
                    response.writeHead(200, {
                    'Content-Length': body.length});
                    response.end(body);}
                    });
		}
        else if (urlArray.length == 1){
            response.setHeader("Content-Type", "text/xml");
            //not_found = wxml.risorse(response, body, config, urlArray);
            wxml.risorse(config, urlArray, function (err, body){
                if (err) not_found = true;
                else {
                    not_found = false;
                    response.writeHead(200, {
                    'Content-Length': body.length});
                    response.end(body);}
                    });
            }
        else if (urlArray.length == 2){
            response.setHeader("Content-Type", "text/xml");
            //not_found = wxml.tilemap(response, body, config, urlArray);
            wxml.tilemap(config, urlArray, function (err, body){
                if (err) not_found = true;
                else {
                    not_found = false;
                    response.writeHead(200, {
                    'Content-Length': body.length});
                    response.end(body);}
                    });
            }
        else if (urlArray.length == 5){
            var mappe = require('./mappe.js');
            //not_found = mappe.mappa(response, config, urlArray);
            mappe.mappa(response, config, urlArray, function(err, buffer){
                if (err) { not_found = false;
                    response.statusCode = 404;
                    response.setHeader('Content-Type', 'text/plain');
                    response.end(buffer);	
                } else {
                    console.log('mostro la mappa');
                    not_found = false;
                    response.writeHead(200, {'Content-Type': 'image/png'});
                    response.end(buffer);
                }
            });
            }
        else if (urlArray.length == 8){
            console.log(urlArray);
            var mappe = require('./mappe.js');
            if (urlArray[2] == 'create'){
                var level = urlArray[3];
                var xini = urlArray[4];
                var xfin = urlArray[5];
                var yini = urlArray[6];
                var yfin = urlArray[7];
                var i = 0, j = 0;
               // var newArray = [urlArray[0], urlArray[1], urlArray[3], '0', '1'];
              //  not_found = mappe.mappa(response, config, newArray);
                for (i = xini; i <= xfin; i++){
                    for (j = yini; j <= yfin; j++){
                        var newArray = [urlArray[0], urlArray[1], urlArray[3], i + '', j + ''];
                        console.log(newArray);
                    mappe.crea(response, config, newArray);
                    }
                }
            }
        }
        else if (not_found) {
            console.log('errore not found');
            response.statusCode = 404;
            response.setHeader('Content-Type', 'text/plain');
            response.end('Not Found');}		
});
server.listen(port, host);
console.log("server listening at " + host + " on port " + port);

