exports.invoke = function(req, resp) {
	var content = '<!DOCTYPE html>';
	content = '<html>\n';
	content = '   <head>\n';
	content += '    <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.4/leaflet.css" />\n';
	content += '    <!--[if lte IE 8]>\n';
	content += '      <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.4/leaflet.ie.css" />\n';
	content += '    <![endif]-->\n';
	content += '    <script src="http://cdn.leafletjs.com/leaflet-0.4/leaflet.js"></script>\n';
	content += '  </head>\n';
	content += '  <body style="margin: 0; padding: 0;">\n';
	content += '    <div id="map" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;"></div>\n';
	content += '    <script>\n';
	content += '      var baseurl = "http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png";\n';
	content += '      var map = L.map("map").setView([46.498019, 11.354316], 13);\n';
	content += '      L.tileLayer(baseurl).addTo(map);\n';
	content += '    </script>\n';
	content += '  </body>\n';
	content += '</html>';

	resp.statusCode = 200;
	resp.setHeader('Content-Type', 'text/html');
	resp.end(content);
}