// JavaScript Document
var config = require('./config.json');
var host = config.host;
var port = config.port;
var http = require('http'), fs = require('fs');
var child = require('child_process');
var seedProc = new Array; //array for seeding process

var server = http.createServer(function (request, response) {
    var seed = child.fork('./seeding.js');
    var url = require('url').parse(request.url, true);
    var status = '';    //response statuscode
    var format = '';    //image format (png, jpg...)
    //suddivisione url
    var urlArray = url.pathname.split('/');
    if (urlArray[(urlArray.length -1)] == '') {
        urlArray = urlArray.slice(1, -1);
    } else 
        urlArray = urlArray.slice(1);
    var not_found = true; //nel caso in cui la url richiesta non corrisponda a nulla
    var wxml = require ('./writeXml');
    if (url.pathname == "/") {
        wxml.servizi(config, function (err, body){
            if (err)
                status = 404;
            else 
                status = 200;
            writeRes(status, 'xml', body, '');
        });
    }
    else if (urlArray.length == 1){
        wxml.risorse(config, urlArray, function (err, body){
            if (err) status = 404;
            else 
                status = 200;
            writeRes(status, 'xml', body, '');
        });
    }
    else if (urlArray.length == 2){
        if (url.pathname == url.path){
            wxml.tilemap(config, urlArray, function (err, body){
                if (err) status = 404;
            else 
                status = 200;
            writeRes(status, 'xml', body, '');    
            });
        } else {
            if (url.query.op== 'seed'){
//                seedProc[seed.pid] = seed;
                seedProc.push(seed);
//                response.setHeader("Content-Type", "text/plain");
                seed.send({'url' : url, 'config' : config, 'urlA' : urlArray});
                console.log('seeding in corso');
                body = 'Running seeding with PID ' + seed.pid;
                writeRes(200, 'text', body, '');    
            } else if (url.query.op== 'int')
                seedInt(url);
        }
    }
    else if (urlArray.length == 5){
        var mappe = require('./mappe.js');
        mappe.mappa(config, urlArray, false, function(err, buffer){
            if (err)
                writeRes(404, 'text', buffer, '');
            else
                writeRes(200, 'image', buffer, config.services[urlArray[0]].tilemaps[urlArray[1]].TileFormat[2]);
        });
    }
//    else if (not_found) {
//        console.log('errore not found');
//        response.statusCode = 404;
//        response.setHeader('Content-Type', 'text/plain');
//        response.end('Not Found');
//    }	
    
    seed.on('exit', function (code, signal){
        console.log('process exit with code and signal ' + code + ' ' + signal);
        for (index in seedProc) {
            if (seedProc[index].pid == seed.pid){
                seedProc.splice(index, 1);
            }
        }
    });

    function seedInt(url){
//        var callback = arguments[arguments.length - 1];
        if (seedProc.length>0){
            var i = 0, j = 0;
            if (url.search == '?op=int'){
                var body = 'Processi in esecuzione:\n';
                for (index in seedProc){
    //                j++;
                    seedProc[index].send({"url" : url});
                    console.log(url);
                    seedProc[index].on('message', function(m) {
                        i++;
                        body += 'Pid: ' + this.pid +'\n';
                        body += 'Service: ' + m.service +'\n';
                        body += 'Tilemaps: ' + m.tilemaps + '\n';
                        body += 'Boundingbox: ' + m.boundingbox + '\n';
                        body += 'From level: ' + m.from + '\n';
                        body += 'To level: ' + m.to + '\n';
                        body += 'Info: File totali: '+ m.tot + ' - file in elaborazione: ' + m.incorso + ' - file in coda: ' + m.incoda + ' - file elaborati:' + ((m.tot - m.incorso) - m.incoda) + '\n';
                        console.log(body);     
                        if (i == seedProc.length){
                            writeRes(200, 'text', body, format);
    //                        return callback(body);
                            }
                    });
                }
            }
        } else {
            body = 'There is no seeding process currently running';
            writeRes(200, 'text', body, format);
            }
    }
    
    function writeRes(status, type, body, format){
        if (status != '')
            response.statusCode = status;
        switch (type){
            case 'text': response.setHeader('Content-Type', 'text/plain');
            break;
            case 'xml': response.setHeader('Content-Type', 'text/xml');
            break;
            case 'image': response.setHeader('Content-Type', format);
            break;
        }
        response.setHeader('Content-Length', body.length);
        response.end(body);
        
    }
});
server.listen(port, host);
console.log("server listening at " + host + " on port " + port);