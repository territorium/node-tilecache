// JavaScript Document
var http = require('http'), fs = require('fs');
var server = http.createServer(function (request, response) {
        //suddivisione url
	var url = request.url;
        var urlArray = url.split('/');
        if (urlArray[(urlArray.length -1)] == '') {
            urlArray = urlArray.slice(1, -1);}
        else 
        urlArray = urlArray.slice(1);
        var body = "";
	var config = require('./config.json');
        var not_found = true; //nel caso in cui la url richiesta non corrisponda a nulla
        var wxml = require ('./writeXml');
	if (url == "/") {
                not_found = false;
                wxml.servizi(response, body, config);
		}
        else if (urlArray.length == 1){
           not_found = wxml.risorse(response, body, config, urlArray);
            }
        else if (urlArray.length == 2){
            not_found = wxml.tilemap(response, body, config, urlArray);
            }
        else if (urlArray.length == 5){
            var mappe = require('./mappe.js');
            not_found = mappe.mappa(response, config, urlArray);
                                // }
            }
                   if (not_found) {
            response.statusCode = 404;
            response.setHeader('Content-Type', 'text/plain');
            response.end('Not Found');}		
});
server.listen(3000);

