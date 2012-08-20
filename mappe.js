exports.mappa = function (response, config, urlArray){
var fs = require('fs'), cache = require('./cache');
not_found = true;
for (index in config.services) {
    if (urlArray[0] == (config.services[index].name_service)) {
        for (ind in config.services[index].tilemaps){
            if (urlArray[1] == (config.services[index].tilemaps[ind].map)){
                //var tilemaps = config.services[index].tilemaps[ind];
                if ((urlArray[2] >= 0) && (urlArray[2] < (config.services[index].tilemaps[ind].tilesets.length))){
                    not_found = false;
                    var res = config.services[index].tilemaps[ind].tilesets[urlArray[2]];
                    var xdim = config.services[index].tilemaps[ind].TileFormat[0];
                    var ydim = config.services[index].tilemaps[ind].TileFormat[1];
                    var xorig = config.services[index].tilemaps[ind].origin[0];
                    var yorig = config.services[index].tilemaps[ind].origin[1];
                    var minx = (res * xdim * urlArray[3]) + xorig;
                    var maxx = (res * xdim * (parseInt(urlArray[3]) + 1)) + xorig;
                    var miny = (res * ydim * urlArray[4]) + yorig;
                    var maxy = (res * ydim * (parseInt(urlArray[4]) + 1)) + yorig;
                    var bbox = [minx, miny, maxx, maxy];
                    var numlevelx = Math.ceil((config.services[index].tilemaps[ind].boundingbox[2] - config.services[index].tilemaps[ind].boundingbox[0])/(xdim*res));
                    var numlevely = Math.ceil((config.services[index].tilemaps[ind].boundingbox[3] - config.services[index].tilemaps[ind].boundingbox[1])/(ydim*res));
                    if (urlArray[3] > (numlevelx -1) || urlArray[4] > (numlevely - 1)){
                        response.statusCode = 404;
                        response.setHeader('Content-Type', 'text/plain');
                        response.write('index out of bounds: ');
                        response.write(' Max x level = ' + (numlevelx - 1));
                        response.write(' Max y level = ' + (numlevely - 1));
                        response.end();
                        return not_found;
                        }
                    
                    //controllo l'esistenza del file
                    var cache = require('./cache.js');
                    var percorso = cache.coordConvert(config.cache_dir, config.services[index].tilemaps[ind].dir, urlArray[2], urlArray[3], urlArray[4], numlevely, config.services[index].tilemaps[ind].TileFormat[3]);
                    var root = __dirname + '/' + percorso.join('/');
                    //fine controllo
                    var option = {"format" : config.services[index].tilemaps[ind].TileFormat[3]};
                    var stylesheet = './' + config.services[index].name_service +'/'+ config.services[index].tilemaps[ind].map;
                    var fs = require('fs');
                    //var cache = require('./cache.js');
                    fs.readFile(root, function (err, buffer){
                        if (err) {
                            var esiste = cache.controlla(percorso, '');
                            var mapnik = require('mapnik');
                            var map = new mapnik.Map(xdim, ydim);
                            map.load(stylesheet, function(err,map) {
                                if (err) {
                                    response.end(err.message);
                                }
                                map.zoomToBox(bbox);    
                                var im = new mapnik.Image(xdim, ydim);
                                var path = require('path');
                                map.renderFileSync(path.resolve(root), option);
                                console.log('creo il file ' + path.resolve(root));
                                 map.render(im, function(err,im) {
                                    if (err) {
                                        er = true;
                                        response.end(err.message);
                                    } else {
                                        im.encode(option.format, function(err,buffer) {
                                            if (err) {
                                                response.end(err.message);
                                            } else {
                                                //buf = buffer;
                                                response.writeHead(200, {'Content-Type': 'image/png'});
                                                response.end(buffer);
                                            }
                                        });
                                    }
                                });
                            });
                        } else {
                       response.writeHead(200, {'Content-Type': 'image/png'});
                       response.end(buffer);
                       }
                    });    
                }
            }
        }
    }
}    
return not_found;    
}

exports.crea = function (response, config, urlArray){
var fs = require('fs'), cache = require('./cache');
not_found = true;
for (index in config.services) {
    if (urlArray[0] == (config.services[index].name_service)) {
        for (ind in config.services[index].tilemaps){
            if (urlArray[1] == (config.services[index].tilemaps[ind].map)){
                //var tilemaps = config.services[index].tilemaps[ind];
                if ((urlArray[2] >= 0) && (urlArray[2] < (config.services[index].tilemaps[ind].tilesets.length))){
                    not_found = false;
                    var res = config.services[index].tilemaps[ind].tilesets[urlArray[2]];
                    var xdim = config.services[index].tilemaps[ind].TileFormat[0];
                    var ydim = config.services[index].tilemaps[ind].TileFormat[1];
                    var xorig = config.services[index].tilemaps[ind].origin[0];
                    var yorig = config.services[index].tilemaps[ind].origin[1];
                    var minx = (res * xdim * urlArray[3]) + xorig;
                    var maxx = (res * xdim * (parseInt(urlArray[3]) + 1)) + xorig;
                    var miny = (res * ydim * urlArray[4]) + yorig;
                    var maxy = (res * ydim * (parseInt(urlArray[4]) + 1)) + yorig;
                    var bbox = [minx, miny, maxx, maxy];
                    var numlevelx = Math.ceil((config.services[index].tilemaps[ind].boundingbox[2] - config.services[index].tilemaps[ind].boundingbox[0])/(xdim*res));
                    var numlevely = Math.ceil((config.services[index].tilemaps[ind].boundingbox[3] - config.services[index].tilemaps[ind].boundingbox[1])/(ydim*res));
                    if (urlArray[3] > (numlevelx -1) || urlArray[4] > (numlevely - 1)){
                        response.statusCode = 404;
                        response.setHeader('Content-Type', 'text/plain');
                        response.write('index out of bounds: ');
                        response.write(' Max x level = ' + (numlevelx - 1));
                        response.write(' Max y level = ' + (numlevely - 1));
                        response.end();
                        return not_found;
                        }
                    
                    //controllo l'esistenza del file
                    var cache = require('./cache.js');
                    var percorso = cache.coordConvert(config.cache_dir, config.services[index].tilemaps[ind].dir, urlArray[2], urlArray[3], urlArray[4], numlevely, config.services[index].tilemaps[ind].TileFormat[3]);
                    var root = __dirname + '/' + percorso.join('/');
                    //fine controllo
                    var option = {"format" : config.services[index].tilemaps[ind].TileFormat[3]};
                    var stylesheet = './' + config.services[index].name_service +'/'+ config.services[index].tilemaps[ind].map;
                    var fs = require('fs');
                    //var cache = require('./cache.js');
                    fs.readFile(root, function (err, buffer){
                        if (err) {
                            var esiste = cache.controlla(percorso, '');
                            var mapnik = require('mapnik');
                            var map = new mapnik.Map(xdim, ydim);
                            map.load(stylesheet, function(err,map) {
                                if (err) {
                                    response.end(err.message);
                                }
                                map.zoomToBox(bbox);    
                                var im = new mapnik.Image(xdim, ydim);
                                var path = require('path');
                                map.renderFileSync(path.resolve(root), option);
                                console.log('creo il file ' + path.resolve(root));
                            });
                        } else {
                       // response.writeHead(200, {'Content-Type': 'image/png'});
                       // response.end(buffer);
                       }
                    });    
                }
            }
        }
    }
}    
return not_found;    
}