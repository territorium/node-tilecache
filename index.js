// JavaScript Document
var config = require('./config.json');
var host = config.host;
var port = config.port;
var http = require('http'), fs = require('fs');
var child = require('child_process');
var seed;
var seedProc = [];
var server = http.createServer(function (request, response) {
        
	
        
        var url_prova = require('url').parse(request.url, true);
        var url = url_prova.pathname;
        //console.log(url_prova);
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
            if (url_prova.pathname !== url_prova.path){
                
                if (url_prova.query.op== 'seed'){
                    seed = child.fork('./seeding.js');
                    seedProc.push(seed);
                    response.setHeader("Content-Type", "text/plain");
                console.log(url_prova.query);
            seed.send({"url" : url_prova, "config" : config, urlA : urlArray});
            console.log('seeding in corso');
            body = 'Seeding in corso';
            response.writeHead(200, {
                    'Content-Length': body.length});
                    response.end(body);
                    } else if (url_prova.query.op== 'int'){
                      var cseed = seedProc[0];  
                      cseed.send({"url" : url_prova, "config" : config, urlA : urlArray});
                      response.setHeader("Content-Type", "text/plain");
                        cseed.on('message', function(m) {
            body = 'File totali: '+ m.tot + ' - file in elaborazione: ' + m.incorso + ' - file in coda: ' + m.incoda + ' - file elaborati:' + ((m.tot - m.incorso) - m.incoda);
            console.log(body);
            });    
            response.writeHead(200, {
                    'Content-Length': body.length});
                    response.end(body);
                        
                        }
                
        } else {
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
            }
        else if (urlArray.length == 5){
            var mappe = require('./mappe.js');
            //not_found = mappe.mappa(response, config, urlArray);
            mappe.mappa(config, urlArray, function(err, buffer){
                if (err) { not_found = false;
                    response.statusCode = 404;
                    response.setHeader('Content-Type', 'text/plain');
                    console.log('errore');
                    response.end(buffer);	
                } else {
                    console.log('mostro la mappa');
                    not_found = false;
                    response.writeHead(200, {'Content-Type': config.services[urlArray[0]].tilemaps[urlArray[1]].TileFormat[2]});
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



