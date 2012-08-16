// JavaScript Document
var http = require('http'), fs = require('fs');
var server = http.createServer(function (request, response) {
        //suddivisione url
	var url = request.url;
        //console.log(require('url').parse(request.url));
        //console.log(request.url);
        var urlArray = url.split('/');
        if (urlArray[(urlArray.length -1)] == '') {
            urlArray = urlArray.slice(1, -1);}
        else 
        urlArray = urlArray.slice(1);
        //var lung = urlArray.length;
        console.log(urlArray);
        
        var body = "";
	var config = require('./config.json');
        var not_found = true; //nel caso in cui la url richiesta non corrisponda a nulla
        function servizi(response, body, config){
            response.setHeader("Content-Type", "text/xml");
            body = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?><Services>"
            for (index in config.services) {
                    body += "<TileMapService title=\"" + config.services[index].title;
                    body += "\" href=\""+ config.baseurl + config.services[index].name_service + "\"";
                    body +="/>";
		}
            body += " </Services>";
            response.writeHead(200, {
            'Content-Length': body.length});
            response.write(body);
            response.end();
            }
        function risorse(response, body, config){
                response.setHeader("Content-Type", "text/xml");
                body = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?><TileMapService version=\"1.0.0\" services=\"" + config.baseurl + "\">";
                var servizio = config.services[index];
                body += "<Title>" + servizio.title +"</Title>";
                body += "<Abstract>" + servizio.abstractT + "</Abstract><TileMaps>";
                for (ind in servizio.tilemaps){
                body += "<TileMap title=\""+servizio.tilemaps[ind].title+"\" srs=\""+servizio.tilemaps[ind].SRS+"\" profile=\""+servizio.tilemaps[ind].profile;
                body +="\" href=\""+config.baseurl + servizio.name_service +"/"+ servizio.tilemaps[ind].map+"\" />"
                }
                body += "</TileMaps></TileMapService>";
                response.writeHead(200, {
  		'Content-Length': body.length});
                response.write(body);
  		response.end();
            }
	if (url == "/") {
                not_found = false;
		servizi(response, body, config);
		}
        else if (urlArray.length == 1){
            for (index in config.services) {
            if (urlArray[0] == (config.services[index].name_service)) {
                not_found = false;
                risorse(response, body, config);
            }}}
        else if (urlArray.length == 2){
            for (index in config.services) {
                if (urlArray[0] == (config.services[index].name_service)) {
                    for (ind in config.services[index].tilemaps){
                        if (urlArray[1] == (config.services[index].tilemaps[ind].map)){
                            not_found = false;
                            var tilemaps = config.services[index].tilemaps[ind];
                console.log("tilemaps");
                response.setHeader("Content-Type", "text/xml");
                body = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>";  
                body += "<TileMap version=\"1.0.0\" tilemapservice=\""+config.baseurl+ config.services[index].name_service+"\">";
                body += "<Title>"+tilemaps.title+"</Title>";
                body += "<Abstract>"+config.services[index].abstractT+"</Abstract>";
                body += "<SRS>"+tilemaps.SRS+"</SRS>";
                body += "<BoundingBox minx=\""+tilemaps.boundingbox[0]+"\" miny=\""+tilemaps.boundingbox[1];
                body += "\" maxx=\""+tilemaps.boundingbox[2]+"\" maxy=\""+tilemaps.boundingbox[3]+"\" />";
                body += "<Origin x=\""+tilemaps.origin[0]+"\" y=\""+tilemaps.origin[1]+"\" />";
                body += "<TileFormat width=\""+tilemaps.TileFormat[0]+"\" height=\""+tilemaps.TileFormat[1];
                body += "\" mime-type=\""+config.services[index].tilemaps[ind].TileFormat[2]+"\" extension=\""+config.services[index].tilemaps[ind].TileFormat[3]+"\" />";
                body += "<TileSets profile=\""+tilemaps.profile+"\">";
                for (upp in tilemaps.tilesets){
                body += "<TileSet href=\""+config.baseurl + config.services[index].name_service +"/"+ tilemaps.map+"/"+upp
                body += "\" units-per-pixel=\""+tilemaps.tilesets[upp]+"\" order=\""+upp+"\" />"
                }
                body += "</TileSets></TileMap>";
                response.writeHead(200, {
  		'Content-Length': body.length});
                response.write(body);
  		response.end();
                }
                 
            }
            }}}
        else if (urlArray.length == 5){
            for (index in config.services) {
                if (urlArray[0] == (config.services[index].name_service)) {
                    for (ind in config.services[index].tilemaps){
                        if (urlArray[1] == (config.services[index].tilemaps[ind].map)){
                            //not_found = false;
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
                                console.log(urlArray[4] + 1);
                                console.log("bbox is " + bbox);
                                console.log('res is ' + res);
                                console.log('xorig is ' + xorig);
                                console.log('yorig is ' + yorig);
                                console.log('minx ' + minx);
                                console.log('maxx ' + maxx);
                                console.log('miny ' + miny);
                                console.log('maxy ' + maxy);
                                console.log(urlArray[3]);
                                console.log(urlArray[4]);
                                var mapnik = require('mapnik');
                                var map = new mapnik.Map(xdim, ydim);
                                var stylesheet = './' + config.services[index].name_service +'/'+ config.services[index].tilemaps[ind].map;
                                map.load(stylesheet, function(err,map) {
                                     if (err) {
                                         res.end(err.message);
                                         }
                                     map.zoomToBox(bbox);    
                                    
                                    var im = new mapnik.Image(xdim, ydim);
                                    map.render(im, function(err,im) {
                                        if (err) {
                                            res.end(err.message);
                                            } else {
                                                im.encode('png', function(err,buffer) {
                                                    if (err) {
                                                        res.end(err.message);
                                                        } else {
                                                            response.writeHead(200, {'Content-Type': 'image/png'});
                                                            response.end(buffer);
                                                            }})}})})
                                
                                
                                
                                
                                //map.extent = bbox;
                                //map.maximumExtension = bbox;
                                
                               // map.renderFileSync('map.png');
                                }
            }}}}}
                   if (not_found) {
            response.statusCode = 404;
            response.setHeader('Content-Type', 'text/plain');
            response.end('Not Found');}

		
});
server.listen(3000);

