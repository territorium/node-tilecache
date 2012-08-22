exports.mappa = function (config, urlArray){
var callback = arguments[arguments.length - 1];
//if (typeof(callback) !== 'function') callback = function(){};
var fs = require('fs'), cache = require('./cache');
var er = true;

var service = config.services[urlArray[0]];
if (typeof(service) !== 'undefined'){
var tilemaps = config.services[urlArray[0]].tilemaps[urlArray[1]];
if (typeof(tilemaps) !== 'undefined') {
                if ((urlArray[2] >= 0) && (urlArray[2] < (tilemaps.tilesets.length))){
                    er = false;

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
                        var body = 'Index out of bounds: Max x level = ' + (numlevelx - 1) + ' - Max y level = ' + (numlevely - 1);
                        er = true;
                        return callback(er, body);
                        }
                    
                    //controllo l'esistenza del file
                    var cache = require('./cache.js');
                    
                    var percorso = cache.coordConvert(config.cache_dir, tilemaps.cache, urlArray[2], urlArray[3], urlArray[4], numlevely, tilemaps.TileFormat[3]);
                    var root = config.baseurl + percorso.join('/');
                    //fine controllo
                    var format ='';
                    if (tilemaps.TileFormat[3] == 'jpg'){
                        format = 'jpeg';
                        } else {
                            format = tilemaps.TileFormat[3];
                        }
                    var option = {"format" : format};
                    var stylesheet = config.baseurl + config.service_dir +'/'+ tilemaps.dir + '/'+ urlArray[1];
                    var fs = require('fs');
                    var buffer;
                    var mkdir = require('./mkdir.js');
                    fs.readFile(root, function (err, buffer){
                        
                        if (err) {
                            mkdir.makedir(config.baseurl + percorso.slice(0, -1).join('/'), function(err){
                               if (err) {er = true;
                                    return callback(err, buffer);} 
                                else {
                            var mapnik = require('mapnik');
                            var map = new mapnik.Map(xdim, ydim, config.srs[tilemaps.SRS]);
                            map.load(stylesheet, function(err,map) {
                                if (err) {
                                    er = true;
                                    return callback (er, err.message);
                                } else {
                                map.maximumExtent = tilemaps.boundingbox;
                                map.extent = tilemaps.boundingbox;
                                map.srs = config.srs[tilemaps.SRS];
                                map.zoomToBox(bbox);    
                                var im = new mapnik.Image(xdim, ydim);
                                var path = require('path');
                                map.renderFileSync(path.resolve(root), option);
                                console.log('creo il file ' + path.resolve(root));
                                map.render(im, function(err,im) {
                                    if (err) {
                                        er = true;
                                        return callback (er, err.message);
                                    } else {
                                        im.encode(option.format, function(err,buffer) {
                                            if (err) {
                                                er = true;
                                                return callback (er, err.message);
                                            } else {
                                                er = false;
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
                            return callback (er, buffer);
                        }
                    });    
                }
            }
        }
 
}
