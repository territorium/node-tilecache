// JavaScript Document
var http = require('http'), fs = require('fs');
var server = http.createServer(function (request, response) {
	//var url = require('url').parse(request.url);
	var url = request.url;
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
  'Content-Length': body.length,
 	});
  response.write(body);
  response.end();
		}
});
server.listen(3000);

