// JavaScript Document
var config = require('./config.json');
var host = config.host;
var port = config.port;
var http = require('http'), fs = require('fs');
var child = require('child_process');
var seedProc = new Array;
var server = http.createServer(function (request, response) {
    var seed = child.fork('./seeding.js');
        var url_prova = require('url').parse(request.url, true);
        var url = url_prova.pathname;
//        console.log(url_prova);
//        suddivisione url
        var urlArray = url.split('/');
        if (urlArray[(urlArray.length -1)] == '') {
            urlArray = urlArray.slice(1, -1);}
        else 
        urlArray = urlArray.slice(1);
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
                    seedProc[seed.pid] = seed;
                    response.setHeader("Content-Type", "text/plain");
                console.log(url_prova.query);
            seed.send({"url" : url_prova, "config" : config, urlA : urlArray});
            console.log('seeding in corso');
            body = 'Seeding in corso';
            response.writeHead(200, {
                    'Content-Length': body.length});
                    response.end(body);
                    } else if (url_prova.query.op== 'int'){
                        seedInt(url_prova, function(body){
                            
                            console.log('stampo');
                                                  response.setHeader("Content-Type", "text/plain");    
            response.writeHead(200, {
                    'Content-Length': body.length});
                    response.end(body);
                            });
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
                    not_found = false;
                    response.writeHead(200, {'Content-Type': config.services[urlArray[0]].tilemaps[urlArray[1]].TileFormat[2]});
                    response.end(buffer);
                }
            });
            }
        else if (not_found) {
            console.log('errore not found');
            response.statusCode = 404;
            response.setHeader('Content-Type', 'text/plain');
            response.end('Not Found');}	
        
  seed.on('exit', function (code, signal){
      console.log('process exit with code and signal ' + code + ' ' + signal);
      seedProc.splice(seed.pid, 1);
      });

function seedInt(url_prova){
     var callback = arguments[arguments.length - 1];
    var i = 0, j = 0;
    if (url_prova.search == '?op=int'){
        var body = 'Processi in esecuzione:\n';
        for (index in seedProc){
            j++;
            
            seedProc[index].send({"url" : url_prova});
            console.log(url_prova);
            seedProc[index].on('message', function(m) {
            i++;
            console.log(i);
            console.log(j);
            body += 'Pid: ' + this.pid +'\n';
            body += 'Service: ' + m.service +'\n';
            body += 'Tilemaps: ' + m.tilemaps + '\n';
            body += 'Boundingbox: ' + m.boundingbox + '\n';
            body += 'From level: ' + m.from + '\n';
            body += 'To level: ' + m.to + '\n';
            body += 'Info: File totali: '+ m.tot + ' - file in elaborazione: ' + m.incorso + ' - file in coda: ' + m.incoda + ' - file elaborati:' + ((m.tot - m.incorso) - m.incoda) + '\n';
            console.log(body);     
            if (i == j){
                return callback(body);
                }
            });
            }
    }
}

      
            
});
server.listen(port, host);
console.log("server listening at " + host + " on port " + port);