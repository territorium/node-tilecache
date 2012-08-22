exports.mappa = function (config, urlArray){
var callback = arguments[arguments.length - 1];
//if (typeof(callback) !== 'function') callback = function(){};
var fs = require('fs'), cache = require('./cache');
var er = true;
for (index in config.services) {
    var service = config.services[index];
    if (urlArray[0] == (service.name_service)) {
        for (ind in service.tilemaps){
            var tilemaps = service.tilemaps[ind];
            if (urlArray[1] == (tilemaps.map)){

                //var tilemaps = config.services[index].tilemaps[ind];
                if ((urlArray[2] >= 0) && (urlArray[2] < (tilemaps.tilesets.length))){
                    er = false;
                    //for (i in config.srs){
                      //  if (tilemaps.SRS == i) {
                        //    srs = config.srs[i];
                          //  console.log('srs =' +srs);
                     //   }
                   // }
                                   //console.log(urlArray);
                //console.log(tilemaps);
                    var res = tilemaps.tilesets[urlArray[2]];
                    var xdim = tilemaps.TileFormat[0];
                    var ydim = tilemaps.TileFormat[1];
                    var xorig = tilemaps.origin[0];
                    var yorig = tilemaps.origin[1];
                    var minx = (res * xdim * urlArray[3]) + xorig;
                    var maxx = (res * xdim * (parseInt(urlArray[3]) + 1)) + xorig;
                    var miny = (res * ydim * urlArray[4]) + yorig;
                    var maxy = (res * ydim * (parseInt(urlArray[4]) + 1)) + yorig;
                    var bbox = [minx, miny, maxx, maxy];
                    var numlevelx = Math.ceil((tilemaps.boundingbox[2] - tilemaps.boundingbox[0])/(xdim*res));
                    var numlevely = Math.ceil((tilemaps.boundingbox[3] - tilemaps.boundingbox[1])/(ydim*res));
                    if (urlArray[3] > (numlevelx -1) || urlArray[4] > (numlevely - 1)){
                        //response.statusCode = 404;
                        //response.setHeader('Content-Type', 'text/plain');
                        var body = 'Index out of bounds: Max x level = ' + (numlevelx - 1) + ' - Max y level = ' + (numlevely - 1);
                        er = true;
                        return callback(er, body);
                        }
                    
                    //controllo l'esistenza del file
                    var cache = require('./cache.js'); //provare a toglierlo
                    var percorso = cache.coordConvert(config.cache_dir, tilemaps.cache, urlArray[2], urlArray[3], urlArray[4], numlevely, tilemaps.TileFormat[3]);
                    //var root = __dirname + '/' + percorso.join('/');
                    var root = config.baseurl + percorso.join('/');
                    //var esiste = cache.controlla(percorso, '');
                    //fine controllo
                    var option = {"format" : tilemaps.TileFormat[3]};
                    var stylesheet = config.baseurl + config.service_dir +'/'+ tilemaps.dir + '/'+ tilemaps.map;
                    var fs = require('fs');
                    var buffer;
                    var mkdir = require('./mkdir.js');
                    fs.readFile(root, function (err, buffer){
                        
                        if (err) {
                            mkdir.makedir(config.baseurl + percorso.slice(0, -1).join('/'), function(err){
                               if (err) {er = true;
                                    return callback(err, buffer);} 
                                else {
                            
                            
                            //var esiste = cache.controlla(percorso, config.baseurl); //cancelabile?
                            var mapnik = require('mapnik');
                            var map = new mapnik.Map(xdim, ydim, config.srs[tilemaps.SRS]);
                                map.maximumExtent = tilemaps.boundingbox;
                                map.extent = tilemaps.boundingbox;
                                map.srs = config.srs[tilemaps.SRS];
                            map.load(stylesheet, function(err,map) {
                                if (err) {
                                    er = true;
                                    //response.end(err.message);
                                    //buffer = err.message;
                                    return callback (er, err.message);
                                } else {
                                console.log(ind);
                                console.log(tilemaps);
                                map.zoomToBox(bbox);    
                                var im = new mapnik.Image(xdim, ydim);
                                var path = require('path');
                                //console.log(option.format);
                                map.renderFileSync(path.resolve(root), option);
                                console.log('creo il file ' + path.resolve(root));
                                map.render(im, function(err,im) {
                                    if (err) {
                                        er = true;
                                        //response.end(err.message);
                                        return callback (er, err.message);
                                        //buffer = err.message;
                                    } else {
                                        im.encode(option.format, function(err,buffer) {
                                            if (err) {
                                                er = true;
                                                console.log('primo');
                                                //response.end(err.message);
                                                return callback (er, err.message);
                                                //buffer = err.message;
                                            } else {
                                                er = false;

                                                //buf = buffer;
                                                //response.writeHead(200, {'Content-Type': 'image/png'});
                                                //response.end(buffer);
                                                return callback (er, buffer);
                                            }
                                        });
                                    }
                                });
                            }
                            });
                        }});
                        } else {
                            er = false;
                            buf = buffer;
                            //console.log(buffer);
                            return callback (er, buffer);
                       // response.writeHead(200, {'Content-Type': 'image/png'});
                        //response.end(buffer);
                        }
                    });    
                }
            }
        }
    }
}    
//console.log(er);
//return callback (er, buffer);
}
