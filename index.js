// JavaScript Document
var http = require('http'), fs = require('fs');
var server = http.createServer(function (request, response) {
	//var url = require('url').parse(request.url);
	var url = request.url;
        var body = "";
        console.log(url);
        console.log(require('url').parse(request.url));
	var config = require('./config.json');
        
	if (url == "/") {
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
        else for (index in config.services) {
        if (url == ("/" + config.services[index].name_service)) {
                response.setHeader("Content-Type", "text/xml");
                body = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?><TileMapService version=\"1.0.0\" services=\"" + config.baseurl + "\">";
                body += "<Title>" + config.services[index].title +"</Title>";
                body += "<Abstract>" + config.services[index].abstractT + "</Abstract><TileMaps>";
                for (ind in config.services[index].tilemaps){
                body += "<TileMap title=\""+config.services[index].tilemaps[ind].title+"\" srs=\""+config.services[index].tilemaps[ind].SRS+"\" profile=\""+config.services[index].tilemaps[ind].profile;
                body +="\" href=\""+config.baseurl + config.services[index].name_service +"/"+ config.services[index].tilemaps[ind].map+"\" />"
                }
                body += "</TileMaps></TileMapService>";
                response.writeHead(200, {
  		'Content-Length': body.length});
                response.write(body);
  		response.end();
            }
        else for (ind in config.services[index].tilemaps){
            if (url == ("/" + config.services[index].name_service + "/" + config.services[index].tilemaps[ind].map)){
                console.log("tilemaps");
                response.setHeader("Content-Type", "text/xml");
                body = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>";  
                body += "<TileMap version=\"1.0.0\" tilemapservice=\""+config.baseurl+ config.services[index].name_service+"\">";
                body += "<Title>"+config.services[index].tilemaps[ind].title+"</Title>";
                body += "<Abstract>"+config.services[index].abstractT+"</Abstract>";
                body += "<SRS>"+config.services[index].tilemaps[ind].SRS+"</SRS>";
                body += "<BoundingBox minx=\""+config.services[index].tilemaps[ind].boundingbox[0]+"\" miny=\""+config.services[index].tilemaps[ind].boundingbox[1];
                body += "\" maxx=\""+config.services[index].tilemaps[ind].boundingbox[2]+"\" maxy=\""+config.services[index].tilemaps[ind].boundingbox[3]+"\" />";
                body += "<Origin x=\""+config.services[index].tilemaps[ind].origin[0]+"\" y=\""+config.services[index].tilemaps[ind].origin[1]+"\" />";
                body += "<TileFormat width=\""+config.services[index].tilemaps[ind].TileFormat[0]+"\" height=\""+config.services[index].tilemaps[ind].TileFormat[1];
                body += "\" mime-type=\""+config.services[index].tilemaps[ind].TileFormat[2]+"\" extension=\""+config.services[index].tilemaps[ind].TileFormat[3]+"\" />";
                body += "<TileSets profile=\""+config.services[index].tilemaps[ind].profile+"\">";
                for (upp in config.services[index].tilemaps[ind].tilesets){
                body += "<TileSet href=\""+config.baseurl + config.services[index].name_service +"/"+ config.services[index].tilemaps[ind].map+"/"+upp
                body += "\" units-per-pixel=\""+config.services[index].tilemaps[ind].tilesets[upp]+"\" order=\""+upp+"\" />"
                }
                body += "</TileSets></TileMap>";
                response.writeHead(200, {
  		'Content-Length': body.length});
                response.write(body);
  		response.end();
                }
            }
            }
		
});
server.listen(3000);

